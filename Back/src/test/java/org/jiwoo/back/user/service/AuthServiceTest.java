package org.jiwoo.back.user.service;

import org.jiwoo.back.common.exception.NotLoggedInException;
import org.jiwoo.back.common.exception.NotMatchedPasswordException;
import org.jiwoo.back.common.exception.UserEmailDuplicateException;
import org.jiwoo.back.user.aggregate.entity.User;
import org.jiwoo.back.user.dto.AuthDTO;
import org.jiwoo.back.user.dto.CurrentUserDTO;
import org.jiwoo.back.user.dto.EditPasswordDTO;
import org.jiwoo.back.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @DisplayName("회원가입 테스트")
    @Test
    void signUpTest() throws UserEmailDuplicateException {

        // given
        AuthDTO authDTO = createAuthDTO();

        // when
        authService.signUp(authDTO);

        // then
        assertTrue(authService.existEmail(authDTO.getEmail()));
    }

    @DisplayName("존재하는 이메일 회원가입 예외 테스트")
    @Test
    void duplicateEmailTest() throws UserEmailDuplicateException {

        // given
        AuthDTO authDTO = createAuthDTO();

        // when
        authService.signUp(authDTO);

        // then
        assertThrows(UserEmailDuplicateException.class, () -> authService.signUp(authDTO));
    }

    @DisplayName("존재하는 이메일 조회 테스트")
    @Test
    void existEmailTest() throws UserEmailDuplicateException {

        // given
        AuthDTO authDTO = createAuthDTO();

        // when
        authService.signUp(authDTO);

        // then
        assertTrue(authService.existEmail(authDTO.getEmail()));
    }

    @DisplayName("존재하지 않는 이메일 조회 테스트")
    @Test
    void notExistEmailTest() {

        // given
        String email = "존재하지않는이메일@notExist.aaa";

        // when, then
        assertFalse(authService.existEmail(email));
    }

    @DisplayName("회원 정보 수정 테스트")
    @Test
    void editUserInfoTest() throws UserEmailDuplicateException, NotLoggedInException {

        // given
        login();
        AuthDTO authDTO = AuthDTO.builder()
                .gender("Female")
                .phoneNo("010-9999-9999")
                .build();

        // when
        CurrentUserDTO targetUser = authService.editUserInfo(authDTO);

        // then
        assertEquals(targetUser.toString(), authService.getCurrentUser().toString());
    }

    @DisplayName("비밀번호 변경 테스트")
    @Test
    void editPasswordTest() throws UserEmailDuplicateException, NotLoggedInException, NotMatchedPasswordException {

        // given
        login();
        String newPassword = "newPassword";
        EditPasswordDTO passwordDTO = new EditPasswordDTO("testPassword", newPassword);

        // when
        CurrentUserDTO targetUser = authService.editPassword(passwordDTO);

        // then
        User user = userRepository.findByEmail(targetUser.getEmail());
        assertTrue(bCryptPasswordEncoder.matches(newPassword, user.getPassword()));
    }

    @DisplayName("잘못된 이전 비밀번호 변경 예외 테스트")
    @Test
    void editPasswordWrongBeforePasswordTest() throws UserEmailDuplicateException {

        // given
        login();
        String newPassword = "newPassword";
        EditPasswordDTO passwordDTO = new EditPasswordDTO("wrongPassword", newPassword);

        // when, then
        assertThrows(NotMatchedPasswordException.class, () -> authService.editPassword(passwordDTO));
    }

    private AuthDTO createAuthDTO() {
        return AuthDTO.builder()
                .name("TestName")
                .email("testUnique@testUnique.com")
                .password("testPassword")
                .birthDate(LocalDate.now())
                .gender("Male")
                .phoneNo("010-1234-1234")
                .build();
    }

    private String signUp() throws UserEmailDuplicateException {
        AuthDTO authDTO = createAuthDTO();
        authService.signUp(authDTO);
        return authDTO.getEmail();
    }

    private String login() throws UserEmailDuplicateException {
        String email = signUp();
        CustomUserDetailsService customUserDetailsService = new CustomUserDetailsService(userRepository);
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities()));

        return email;
    }
}