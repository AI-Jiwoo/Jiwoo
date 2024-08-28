package org.jiwoo.back.common.OpenAI.dto;

import java.util.List;

public record OpenAIResponseDTO(List<Choice> choices) {

    public record Choice(int index, Message message) {
    }
}
