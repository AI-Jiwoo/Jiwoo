package org.jiwoo.back.common.OpenAI.service;

import org.jiwoo.back.common.exception.OpenAIResponseFailException;

public interface OpenAIService {

    String generateAnswer(String questionPrompt) throws OpenAIResponseFailException;
}
