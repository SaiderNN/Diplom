package com.example.SSH_client.ssh;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SshSessionRepository extends JpaRepository<SshSession, String> {

}
