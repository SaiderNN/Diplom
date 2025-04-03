package com.example.SSH_client.ssh;

import org.apache.sshd.client.SshClient;
import org.apache.sshd.client.channel.ChannelExec;
import org.apache.sshd.client.channel.ClientChannelEvent;
import org.apache.sshd.client.session.ClientSession;
import org.apache.sshd.common.config.keys.loader.openssh.OpenSSHKeyPairResourceParser;
import org.apache.sshd.common.util.io.IoUtils;
import org.apache.sshd.common.util.io.resource.IoResource;
import org.apache.sshd.common.util.security.SecurityUtils;
import org.apache.sshd.common.keyprovider.FileKeyPairProvider;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.util.Collections;
import java.util.EnumSet;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class SshService {
    private SshClient client;
    private ClientSession session;

    // Подключение к SSH
    public boolean connect(SshRequest request) {
        try {
            client = SshClient.setUpDefaultClient();
            client.start();

            session = client.connect(request.getUsername(), request.getHost(), request.getPort())
                    .verify(10, TimeUnit.SECONDS)
                    .getSession();

            if (request.getPrivateKeyPath() != null && !request.getPrivateKeyPath().isEmpty()) {
                // Используем SSH-ключ
                KeyPair keyPair = loadKeyPair(request.getPrivateKeyPath());
                if (keyPair != null) {
                    session.addPublicKeyIdentity(keyPair);
                } else {
                    throw new IOException("Ошибка загрузки SSH-ключа");
                }
            } else {
                // Используем пароль
                session.addPasswordIdentity(request.getPassword());
            }

            session.auth().verify(10, TimeUnit.SECONDS);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            close();
            return false;
        }
    }

    // Выполнение команды
    public void executeCommand(String command, WebSocketSession session) {
        try (ChannelExec channel = this.session.createExecChannel(command);
             InputStream inputStream = channel.getInvertedOut()) {

            channel.open().verify(5, TimeUnit.SECONDS);

            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                String output = new String(buffer, 0, bytesRead, StandardCharsets.UTF_8);
                session.sendMessage(new TextMessage(output));  // Отправляем результат через WebSocket
            }
        } catch (Exception e) {
            e.printStackTrace();
            try {
                session.sendMessage(new TextMessage("Ошибка выполнения команды: " + e.getMessage()));  // Отправляем ошибку
            } catch (Exception ignored) {}
        }
    }

    // Загрузка SSH-ключа (Используем OpenSSHKeyPairResourceParser)
    private KeyPair loadKeyPair(String privateKeyPath) throws IOException {
        Path keyPath = Path.of(privateKeyPath);
        if (!Files.exists(keyPath)) {
            throw new IOException("Файл SSH-ключа не найден: " + privateKeyPath);
        }

        byte[] keyData = Files.readAllBytes(keyPath);
        try {
            return OpenSSHKeyPairResourceParser.INSTANCE.loadKeyPairs(null, IoResource.forResource(keyData), null).iterator().next();
        } catch (Exception e) {
            throw new IOException("Ошибка декодирования SSH-ключа: " + e.getMessage(), e);
        }
    }

    // Закрытие соединения
    public void close() {
        try {
            if (session != null) session.close();
            if (client != null) client.stop();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
