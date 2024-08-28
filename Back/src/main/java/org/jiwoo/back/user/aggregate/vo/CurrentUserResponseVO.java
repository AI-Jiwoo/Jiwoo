package org.jiwoo.back.user.aggregate.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CurrentUserResponseVO {
    private String message;
    private String name;
    private String email;
    private String userRole;
    private String birthDate;
    private String gender;
    private String phoneNo;
}
