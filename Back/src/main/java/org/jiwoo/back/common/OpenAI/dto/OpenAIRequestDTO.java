package org.jiwoo.back.common.OpenAI.dto;

import java.util.ArrayList;
import java.util.List;

public class OpenAIRequestDTO {
    private final String model;
    private final List<Message> messages;

    public OpenAIRequestDTO(String model, String prompt) {
        this.model = model;
        this.messages = new ArrayList<>();
        this.messages.add(new Message("user", prompt));
    }

    public String getModel() {
        return model;
    }

    public List<Message> getMessages() {
        return messages;
    }
}
