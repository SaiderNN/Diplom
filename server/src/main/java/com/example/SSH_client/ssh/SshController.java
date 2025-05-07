package com.example.SSH_client.ssh;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ssh")
public class SshController {

    @Autowired
    private SshService sshService;
    @Autowired
    private SshSessionRepository sshSessionRepository;

    @PostMapping("/connect")
    public ResponseEntity<SshResponse> createSession(@RequestBody SshRequest request) throws IOException {
        // Создание сессии
        int sessionId = sshService.createSession(request);

        return ResponseEntity.ok(new SshResponse("Connection established", 200, sessionId));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId) {
        boolean deleted = sshService.deleteSession(sessionId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Сессия удалена"));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Сессия не найдена"));
        }
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<Map<String, String>> updateSession(@PathVariable String sessionId, @RequestBody SshRequest request) {
        boolean updated = sshService.updateSession(sessionId, request);
        if (updated) {
            return ResponseEntity.ok(Map.of("message", "Сессия обновлена"));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Сессия не найдена или ошибка обновления"));
        }
    }


    @PostMapping("/initshell")
    public void startShell(@RequestParam Number sessionId) throws IOException {
        sshService.initShellSession(sessionId.toString());
    }

    @GetMapping("/list")
    public List<SshSession> getSessionsByUserId(@RequestParam int id) {
        return sshSessionRepository.findAllByUser_Id(id);
    }

  //  @PostMapping("/disconnect")
   // public String disconnect() {
   //     sshService.closeSession();
   //     return "SSH-соединение закрыто";
   // }
}
