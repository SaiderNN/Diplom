package com.example.SSH_client.ssh;

import lombok.Data;

@Data
public class SshRequest {
    private String host;
    private int port;
    private String username;
    private String password; // Опционально, если используется аутентификация по паролю
    private String privateKey; // Опционально, если используется SSH-ключ

    public SshRequest(String host, int port, String username, String password, String privateKey) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.privateKey = privateKey;
    }

    // Геттеры
    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getPrivateKey() { return privateKey; }

    // Сеттеры (если нужны)
    public void setHost(String host) { this.host = host; }
    public void setPort(int port) { this.port = port; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }
}
