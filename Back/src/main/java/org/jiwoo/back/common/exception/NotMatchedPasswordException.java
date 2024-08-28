package org.jiwoo.back.common.exception;

public class NotMatchedPasswordException extends CustomException {
    public NotMatchedPasswordException() {
        super("비밀번호 일치하지 않음.");
    }
}