package org.jiwoo.back.user.aggregate.vo;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class EditPasswordRequestVO {

    @NotBlank(message = "이전 비밀번호를 입력해주세요.")
    String oldPassword;

    @NotBlank(message = "새로운 비밀번호를 입력해주세요.")
    String newPassword;
}
