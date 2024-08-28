package org.jiwoo.back.common.exception;

public class CustomException extends Exception {
    public CustomException(String message) {
        super("[ERROR] " + message);
    }
}
