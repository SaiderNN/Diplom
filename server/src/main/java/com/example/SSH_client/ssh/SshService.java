package com.example.SSH_client.ssh;

import org.apache.sshd.client.SshClient;
import org.apache.sshd.client.channel.ChannelShell;
import org.apache.sshd.client.session.ClientSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import java.util.concurrent.*;

@Service
public class SshService {

    @Autowired
    private SshSessionRepository sshSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final SshClient client;
    private final Map<String, ClientSession> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, ShellSession> shellSessions = new ConcurrentHashMap<>();
    private final ExecutorService outputExecutor = Executors.newCachedThreadPool();

    public SshService() {
        client = SshClient.setUpDefaultClient();
        client.start();
    }

    public int createSession(SshRequest request) throws IOException {
        ClientSession session = client.connect(request.getUsername(), request.getHost(), request.getPort())
                .verify()
                .getSession();

        if (request.getPassword() != null) {
            session.addPasswordIdentity(request.getPassword());
        }

        if (request.getPrivateKey() != null) {
            KeyPair keyPair = getKeyPairFromPrivateKey(request.getPrivateKey());
            session.addPublicKeyIdentity(keyPair);
        }

        session.auth().verify();

        SshSession sshSession = new SshSession();
        sshSession.setHost(request.getHost());
        sshSession.setUsername(request.getUsername());
        sshSession.setPassword(request.getPassword());
        sshSession.setSessionState("OPEN");
        sshSessionRepository.save(sshSession);

        int sessionId = sshSession.getSessionId();
        String sessionKey = String.valueOf(sessionId);
        activeSessions.put(sessionKey, session);
        initShellSession(String.valueOf(sessionId));
        return sessionId;
    }

    public void initShellSession(String sessionId) throws IOException {
        ClientSession session = activeSessions.get(sessionId);
        if (session == null || !session.isOpen()) {
            throw new IllegalStateException("SSH session not found or not open.");
        }

        ChannelShell channel = session.createShellChannel();
        channel.setUsePty(true); // ВКЛЮЧАЕМ PTY

        PipedOutputStream pipedOut = new PipedOutputStream();
        PipedInputStream pipedIn = new PipedInputStream(pipedOut);

        channel.setOut(pipedOut);
        channel.setErr(pipedOut);

        channel.open().verify(5, TimeUnit.SECONDS);

        shellSessions.put(sessionId, new ShellSession(channel, channel.getInvertedIn(), pipedOut));

        outputExecutor.submit(() -> {
            try (InputStreamReader reader = new InputStreamReader(pipedIn)) {
                StringBuilder buffer = new StringBuilder();
                int ch;
                long lastCharTime = System.currentTimeMillis();

                while ((ch = reader.read()) != -1) {
                    buffer.append((char) ch);
                    lastCharTime = System.currentTimeMillis();

                    if (ch == '\n') {
                        flushBuffer(buffer, sessionId);
                    } else {
                        // Проверка на паузу (например, 300 мс без символов)
                        while (System.currentTimeMillis() - lastCharTime < 300) {
                            if (reader.ready()) break;
                            Thread.sleep(50);
                        }

                        if (System.currentTimeMillis() - lastCharTime >= 300 && buffer.length() > 0) {
                            flushBuffer(buffer, sessionId);
                        }
                    }
                }

                if (buffer.length() > 0) {
                    flushBuffer(buffer, sessionId);
                }

            } catch (Exception e) {
                messagingTemplate.convertAndSend("/topic/response/" + sessionId, "Ошибка при чтении вывода: " + e.getMessage());
            }
        });
    }

    private void flushBuffer(StringBuilder buffer, String sessionId) {
        String line = buffer.toString();
        buffer.setLength(0);
        messagingTemplate.convertAndSend("/topic/response/" + sessionId, line);
    }







    public void sendToShell(String sessionId, String command) throws IOException {
        ShellSession shell = shellSessions.get(sessionId);
        if (shell == null) throw new IllegalStateException("Shell-сессия не найдена");

        OutputStream in = shell.getInput();
        in.write((command + "\n").getBytes(StandardCharsets.UTF_8));
        in.flush();
    }

    public String getShellOutput(String sessionId) {
        ShellSession shell = shellSessions.get(sessionId);
        if (shell == null) return "";
        return shell.getOutput().toString().trim();
    }

    public void closeSession(String sessionId) throws IOException {
        ShellSession shell = shellSessions.remove(sessionId);
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