package com.example.SSH_client.ssh;

import org.apache.sshd.client.session.ClientSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/ssh")
public class SshController {

    @Autowired
    private SshService sshService;

    @PostMapping("/connect")
    public ResponseEntity<SshResponse> connect(@RequestBody SshRequest request) throws IOException {
        // Создание сессии
        int sessionId = sshService.createSession(request);

        return ResponseEntity.ok(new SshResponse("Connection established", 200, sessionId));
    }

    //@PostMapping("/execute")
    //public String executeCommand(@RequestParam String command) {
    //    return sshService.executeCommand(command);
    //}

  //  @PostMapping("/disconnect")
   // public String disconnect() {
   //     sshService.closeSession();
   //     return "SSH-соединение закрыто";
   // }
}
