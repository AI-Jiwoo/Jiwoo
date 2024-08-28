package org.jiwoo.back.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EditPasswordDTO {
    String oldPassword;
    String newPassword;
}
