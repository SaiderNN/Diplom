package com.example.SSH_client.ssh;

import com.example.SSH_client.user.User;
import org.apache.sshd.client.SshClient;
import org.apache.sshd.client.channel.ChannelShell;
import org.apache.sshd.client.session.ClientSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.*;


@Service
public class SshService {

    @Autowired
    private SshSessionRepository sshSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final SshClient client;
    private final Map<String, ClientSession> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, ShellSession> shellChannels = new ConcurrentHashMap<>();
    private final ExecutorService outputExecutor = Executors.newCachedThreadPool();

    public SshService() {
        client = SshClient.setUpDefaultClient();
        client.start();
    }

    public int createSession(SshRequest request) throws IOException {

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        SshSession sshSession = new SshSession();
        sshSession.setHost(request.getHost());
        sshSession.setUsername(request.getUsername());
        sshSession.setPassword(request.getPassword());
        sshSession.setPrivateKey(request.getPrivateKey());
        sshSession.setSessionState("OPEN");
        sshSession.setUser(currentUser);
        sshSessionRepository.save(sshSession);

        int sessionId = sshSession.getSessionId();
        String sessionKey = String.valueOf(sessionId);
        //activeSessions.put(sessionKey, session);
        //initShellSession(String.valueOf(sessionId));
        return sessionId;
    }

    public void initShellSession(String sessionId) throws IOException {
        SshSession sshSession = sshSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Сессия с id " + sessionId + " не найдена"));

        System.out.println("Создание SSH-сессии:");
        System.out.println("ID: " + sessionId);
        System.out.println("Пользователь: " + sshSession.getUsername());
        System.out.println("Хост: " + sshSession.getHost());

        ClientSession session = client.connect(
                sshSession.getUsername(),
                sshSession.getHost(),
                22
        ).verify().getSession();


        if (sshSession.getPassword() != null) {
            System.out.println("Аутентификация по паролю");
            session.addPasswordIdentity(sshSession.getPassword());
        }

        if (sshSession.getPrivateKey() != null) {
            System.out.println("Аутентификация по приватному ключу");
            KeyPair keyPair = getKeyPairFromPrivateKey(sshSession.getPrivateKey());
            session.addPublicKeyIdentity(keyPair);
        }

        boolean authSuccess = session.auth().verify(15, TimeUnit.SECONDS).isSuccess();
        if (!authSuccess) {
            throw new IllegalStateException("Аутентификация не удалась! Проверь логин/пароль или ключ.");
        }

        activeSessions.put(sessionId, session);

        ChannelShell channel = session.createShellChannel();
        channel.setUsePty(true);

        PipedOutputStream pipedOut = new PipedOutputStream();
        PipedInputStream pipedIn = new PipedInputStream(pipedOut);

        channel.setOut(pipedOut);
        channel.setErr(pipedOut);

        channel.open().verify(5, TimeUnit.SECONDS);

        shellChannels.put(sessionId, new ShellSession(channel, channel.getInvertedIn(), pipedOut));

        outputExecutor.submit(() -> {
            try (InputStreamReader reader = new InputStreamReader(pipedIn)) {
                StringBuilder buffer = new StringBuilder();
                int ch;
                long lastCharTime = System.currentTimeMillis();

                while (true) {
                    if (reader.ready() && (ch = reader.read()) != -1) {
                        buffer.append((char) ch);
                        lastCharTime = System.currentTimeMillis();

                        if (ch == '\n') {
                            flushBuffer(buffer, sessionId);
                        }
                    } else {
                        if (System.currentTimeMillis() - lastCharTime >= 300 && buffer.length() > 0) {
                            flushBuffer(buffer, sessionId);
                        }

                        // Проверяем, не закрылся ли канал (например, сервер оборвал сессию)
                        if (!channel.isOpen()) {
                            messagingTemplate.convertAndSend("/topic/exception/" + sessionId,
                                    "Shell-сессия закрыта удалённым сервером");
                            break;
                        }

                        Thread.sleep(100);
                    }
                    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
                    scheduler.scheduleAtFixedRate(() -> {
                        try {
                            session.sendIgnoreMessage(new byte[0]); // отправка SSH_MSG_IGNORE
                        } catch (IOException e) {
                            // обработка ошибки (разрыв соединения и т.п.)
                        }
                    }, 0, 20, TimeUnit.SECONDS);
                }

            } catch (Exception e) {
                messagingTemplate.convertAndSend("/topic/exception/" + sessionId, "Ошибка shell: " + e.getMessage());
            }

            // Закрытие сессии — вручную, если сервер закрыл соединение
            try {
                closeSession(sessionId);
            } catch (IOException e) {
                messagingTemplate.convertAndSend("/topic/exception/" + sessionId, "Ошибка при закрытии сессии: " + e.getMessage());
            }
        });
    }



    private void flushBuffer(StringBuilder buffer, String sessionId) {
        String line = buffer.toString();
        buffer.setLength(0);
        messagingTemplate.convertAndSend("/topic/response/" + sessionId, line);
    }

    public boolean deleteSession(String sessionId) {
        Optional<SshSession> sessionOpt = sshSessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            sshSessionRepository.deleteById(sessionId);
            // Закрыть SSH-соединение при необходимости
            return true;
        }
        return false;
    }

    public boolean updateSession(String sessionId, SshRequest request) {
        Optional<SshSession> sessionOpt = sshSessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            SshSession session = sessionOpt.get();
            session.setHost(request.getHost());
            session.setUsername(request.getUsername());
            session.setPassword(request.getPassword());
            session.setPrivateKey(request.getPrivateKey());
            sshSessionRepository.save(session);
            return true;
        }
        return false;
    }



    public void sendToShell(String sessionId, String command) throws IOException {
        ShellSession shell = shellChannels.get(sessionId);
        if (shell == null) throw new IllegalStateException("Shell-сессия не найдена");

        OutputStream in = shell.getInput();
        in.write((command + "\n").getBytes(StandardCharsets.UTF_8));
        in.flush();
    }

    public String getShellOutput(String sessionId) {
        ShellSession shell = shellChannels.get(sessionId);
        if (shell == null) return "";
        return shell.getOutput().toString().trim();
    }

    public void closeSession(String sessionId) throws IOException {
        ShellSession shell = shellChannels.remove(sessionId);
        if (shell != null) {
            shell.getChannel().close();
        }

        ClientSession session = activeSessions.remove(sessionId);
        if (session != null && session.isOpen()) {
            session.close();
        }
    }

    private KeyPair getKeyPairFromPrivateKey(String privateKeyString) throws IOException {
        try {
            String privateKeyPEM = privateKeyString.replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\r?\n", "");
            byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);

            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
            PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

            PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(privateKey.getEncoded()));

            return new KeyPair(publicKey, privateKey);
        } catch (Exception e) {
            throw new IOException("Ошибка при обработке приватного ключа", e);
        }
    }
}
