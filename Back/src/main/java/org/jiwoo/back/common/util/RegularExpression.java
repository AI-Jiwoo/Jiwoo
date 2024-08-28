package org.jiwoo.back.common.util;

public class RegularExpression {
    public static final String NAME = "^[가-힣a-zA-Z]+$";
    public static final String PHONE_NUMBER = "^010-?([0-9]{3,4})-?([0-9]{4})$";
    public static final String LOCAL_DATE = "^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$";
}
