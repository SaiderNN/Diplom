package com.example.SSH_client.ssh;

import org.apache.sshd.client.channel.ChannelShell;

import java.io.OutputStream;
import java.io.PipedOutputStream;

public class ShellSession {
    private final ChannelShell channel;
    private final OutputStream input;
    private final PipedOutputStream output;

    public ShellSession(ChannelShell channel, OutputStream input, PipedOutputStream output) {
        this.channel = channel;
        this.input = input;
        this.output = output;
    }

    public ChannelShell getChannel() {
        return channel;
    }

    public OutputStream getInput() {
        return input;
    }

    public PipedOutputStream getOutput() {
        return output;
    }
}