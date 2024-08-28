package org.jiwoo.back.user.aggregate.vo;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import org.jiwoo.back.common.util.RegularExpression;

@Getter
public class EditUserInfoRequestVO {

    private String gender;

    @Pattern(regexp = RegularExpression.PHONE_NUMBER,
            message = "[ERROR] 유효하지 않은 전화번호입니다.")
    private String phoneNo;
}
