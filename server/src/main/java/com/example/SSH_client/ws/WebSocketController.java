package com.example.SSH_client.ws;

import com.example.SSH_client.ssh.SshCommand;
import com.example.SSH_client.ssh.SshService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.io.IOException;

@Controller
public class WebSocketController {
    @Autowired
    private SshService sshService;

    @MessageMapping("/execute")
    public void handleCommand(SshCommand command) throws IOException {
        sshService.sendToShell(command.getSessionId(), command.getCommand());
    }
}
