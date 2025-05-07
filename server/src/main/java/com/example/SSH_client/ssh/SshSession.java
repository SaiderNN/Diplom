package com.example.SSH_client.ssh;


import com.example.SSH_client.user.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int sessionId;

    private String host;
    private String username;
    private String password;

    @Lob  // Приватный ключ может быть длинным — это важно
    private String privateKey;

    private String sessionState;
    private String channelState;

    // Привязка к пользователю
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference // внешний ключ в таблице ssh_session
    private User user;
}
