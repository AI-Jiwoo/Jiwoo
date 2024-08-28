package org.jiwoo.back.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@ToString
public class AuthDTO {
    private String name;
    private String email;
    private String password;
    private String provider;
    private String snsId;
    private LocalDate birthDate;
    private String gender;
    private String phoneNo;

    @Builder
    public AuthDTO(String name, String email, String password, String provider, String snsId, LocalDate birthDate,
                   String gender, String phoneNo) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.provider = provider;
        this.snsId = snsId;
        this.birthDate = birthDate;
        this.gender = gender;
        this.phoneNo = phoneNo;
    }
}
