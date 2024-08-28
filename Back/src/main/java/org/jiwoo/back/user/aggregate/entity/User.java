package org.jiwoo.back.user.aggregate.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.jiwoo.back.user.aggregate.enums.UserRole;
import org.jiwoo.back.user.aggregate.enums.UserRoleConverter;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Getter
@ToString
@Table(name = "tbl_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "PROVIDER", nullable = false)
    private String provider;

    @Column(name = "SNS_ID", unique = true)
    private String snsId;

    @Column(name = "USER_ROLE")
    @Convert(converter = UserRoleConverter.class)
    private UserRole userRole;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Column(name = "GENDER")
    private String gender;

    @Column(name = "PHONE_NO")
    private String phoneNo;

    public void updateGender(String gender) {
        this.gender = gender;
    }

    public void updatePhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    @Builder
    public User(int id, String name, String email, String password, String provider, String snsId, UserRole userRole,
                LocalDate birthDate, String gender, String phoneNo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.provider = provider;
        this.snsId = snsId;
        this.userRole = userRole;
        this.birthDate = birthDate;
        this.gender = gender;
        this.phoneNo = phoneNo;
    }
}
