//
//package com.example.SSH_client.ssh;
//
//import org.apache.sshd.client.channel.ChannelExec;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Controller;
//
//import java.io.IOException;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.concurrent.Executors;
//
//@Controller
//class SshCommandController {
//
//    @Autowired
//    private SshService sshService;
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    // Асинхронный пул для отправки ответов без блокировки входящего потока
//    private final java.util.concurrent.ExecutorService executorService = Executors.newCachedThreadPool();
//
//    @MessageMapping("/execute")
//    public void handleCommand(SshCommand command) throws IOException {
//        sshService.sendToShell(command.getSessionId(), command.getCommand());
//
//        // Запускаем асинхронно получение и отправку ответа
//        executorService.submit(() -> {
//            try {
//                String response = sshService.getShellOutput(command.getSessionId());
//                messagingTemplate.convertAndSend("/topic/response", response);
//            } catch (Exception e) {
//                messagingTemplate.convertAndSend("/topic/response", "Ошибка: " + e.getMessage());
//            }
//        });
//    }
//}
//
//
