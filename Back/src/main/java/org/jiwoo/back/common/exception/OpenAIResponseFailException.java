package org.jiwoo.back.common.exception;

public class OpenAIResponseFailException extends CustomException {

    public OpenAIResponseFailException() {
        super("OpenAI 통신 실패");
    }

    public OpenAIResponseFailException(String message) {
        super(message);
    }
}