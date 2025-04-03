package com.example.SSH_client.ssh;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ssh")
public class SshController {

    @Autowired
    private SshService sshService;

    @PostMapping("/connect")
    public String connect(@RequestBody SshRequest request) {
        boolean isConnected = sshService.connect(request);
        return isConnected ? "SSH-соединение установлено" : "Ошибка подключения";
    }

    //@PostMapping("/execute")
    //public String executeCommand(@RequestParam String command) {
    //    return sshService.executeCommand(command);
    //}

    @PostMapping("/disconnect")
    public String disconnect() {
        sshService.close();
        return "SSH-соединение закрыто";
    }
}
