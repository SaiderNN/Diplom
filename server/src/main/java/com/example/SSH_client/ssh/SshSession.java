package com.example.SSH_client.ssh;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import org.apache.sshd.client.channel.ChannelShell;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
public class SshSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)  // Это важно
    private int sessionId; // Идентификатор сессии

    @Setter
    private String host;
    @Setter
    private String username;
    @Setter
    private String password;
    @Setter
    private String sessionState;
    @Setter
    private String channelState;
}
