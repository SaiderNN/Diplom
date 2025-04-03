package com.example.SSH_client.ws;

import com.example.SSH_client.ssh.SshService;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class SshWebSocketHandler extends TextWebSocketHandler {

    private final SshService sshService;

    public SshWebSocketHandler() {
        this.sshService = new SshService();
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String command = message.getPayload(); // Получаем команду от клиента
        sshService.executeCommand(command, session); // Передаём команду и WebSocket-сессию
    }
}
