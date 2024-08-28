package org.jiwoo.back.user.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.common.exception.NotLoggedInException;
import org.jiwoo.back.common.exception.NotMatchedPasswordException;
import org.jiwoo.back.common.exception.UserEmailDuplicateException;
import org.jiwoo.back.user.aggregate.vo.*;
import org.jiwoo.back.user.dto.AuthDTO;
import org.jiwoo.back.user.dto.CurrentUserDTO;
import org.jiwoo.back.user.dto.EditPasswordDTO;
import org.jiwoo.back.user.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@Slf4j
@Validated
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/exist/email")
    public ResponseEntity<Boolean> existEmail(@RequestBody SignupRequestVO request) {

        if (authService.existEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(true);
        }
        return ResponseEntity.status(HttpStatus.OK).body(false);
    }

    @PostMapping("/signup")
    public ResponseEntity<MessageResponseVO> signup(@Valid @RequestBody SignupRequestVO request) {

        try {
            AuthDTO userInfo = AuthDTO.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(request.getPassword())
                    .birthDate(LocalDate.parse(request.getBirthDate()))
                    .gender(request.getGender())
                    .phoneNo(request.getPhoneNo())
                    .build();
            authService.signUp(userInfo);
        } catch (UserEmailDuplicateException e) {
            return ResponseEntity.badRequest().body(new MessageResponseVO(e.getMessage()));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponseVO("[ERROR] 잘못된 요청입니다."));
        }

        return ResponseEntity.ok().body(new MessageResponseVO(request.getName() + "님 회원 가입을 축하합니다."));
    }

    @PostMapping("/edit/info")
    public ResponseEntity<CurrentUserResponseVO> editUserInfo(@Valid @RequestBody EditUserInfoRequestVO request) {

        CurrentUserResponseVO response = new CurrentUserResponseVO();
        try {
            AuthDTO userInfo = AuthDTO.builder()
                    .gender(request.getGender())
                    .phoneNo(request.getPhoneNo())
                    .build();
            CurrentUserDTO user = authService.editUserInfo(userInfo);

            log.info("Edit User Info: email = {}, gender = {}, phoneNo = {}", user.getEmail(), user.getGender(), user.getPhoneNo());
            response.setMessage("success");
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setUserRole(user.getUserRole());
            response.setBirthDate(user.getBirthDate());
            response.setGender(user.getGender());
            response.setPhoneNo(user.getPhoneNo());

            return ResponseEntity.ok(response);
        } catch (NotLoggedInException e) {
            log.error(e.getMessage(), e);
            response.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            response.setMessage("[ERROR] 잘못된 요청입니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/edit/password")
    public ResponseEntity<MessageResponseVO> editPassword(@Valid @RequestBody EditPasswordRequestVO request) {

        try {
            CurrentUserDTO user = authService.editPassword(new EditPasswordDTO(request.getOldPassword(), request.getNewPassword()));

            log.info("Edit User Password: email = {}, gender = {}, phoneNo = {}", user.getEmail(), user.getGender(), user.getPhoneNo());

            return ResponseEntity.ok(new MessageResponseVO("success"));
        } catch (NotLoggedInException | NotMatchedPasswordException e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponseVO(e.getMessage()));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponseVO("[ERROR] 잘못된 요청입니다."));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<CurrentUserResponseVO> getCurrentUser() {

        CurrentUserResponseVO response = new CurrentUserResponseVO();

        try {
            CurrentUserDTO user = authService.getCurrentUser();
            response.setMessage("success");
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setUserRole(user.getUserRole());
            response.setBirthDate(user.getBirthDate());
            response.setGender(user.getGender());
            response.setPhoneNo(user.getPhoneNo());

            return ResponseEntity.ok(response);
        } catch (NotLoggedInException e) {
            log.error(e.getMessage(), e);
            response.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            response.setMessage("[ERROR] 잘못된 요청입니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
