package com.example.SSH_client.ssh;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SshSessionRepository extends JpaRepository<SshSession, String> {
    List<SshSession> findAllByUser_Id(int id);
}
