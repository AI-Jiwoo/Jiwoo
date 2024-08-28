package org.jiwoo.back.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor
@ToString
@Getter
public class CurrentUserDTO {
    private int id;
    private String name;
    private String email;
    private String userRole;
    private String birthDate;
    private String gender;
    private String phoneNo;

    @Builder
    public CurrentUserDTO(int id, String name, String email, String userRole, String birthDate, String gender, String phoneNo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.userRole = userRole;
        this.birthDate = birthDate;
        this.gender = gender;
        this.phoneNo = phoneNo;
    }
}
