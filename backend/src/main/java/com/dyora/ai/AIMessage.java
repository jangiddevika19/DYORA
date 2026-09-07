package com.dyora.ai;

public record AIMessage(String role, String content) {
    public static AIMessage user(String content) {
        return new AIMessage("user", content);
    }

    public static AIMessage assistant(String content) {
        return new AIMessage("assistant", content);
    }
}
