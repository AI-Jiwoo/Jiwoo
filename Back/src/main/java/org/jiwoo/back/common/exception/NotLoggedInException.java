package org.jiwoo.back.common.exception;

public class NotLoggedInException extends CustomException {
    public NotLoggedInException() {
        super("로그인되지 않음.");
    }
}