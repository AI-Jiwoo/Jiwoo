package org.jiwoo.back.common.exception;

public class UserEmailDuplicateException extends CustomException {
    public UserEmailDuplicateException() {
        super("이메일 중복");
    }
}
