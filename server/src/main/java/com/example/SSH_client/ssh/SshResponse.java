package com.example.SSH_client.ssh;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SshResponse {
    @JsonProperty("welcome_text")
    private String text;
    @JsonProperty("status")
    private int status;
    @JsonProperty("session_id")
    private int id;
}

