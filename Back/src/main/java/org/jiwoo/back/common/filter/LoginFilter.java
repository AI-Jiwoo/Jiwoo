package org.jiwoo.back.common.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.common.util.JwtUtil;
import org.jiwoo.back.user.aggregate.enums.UserRole;
import org.jiwoo.back.user.dto.CustomUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Iterator;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            LoginVO loginVO = new ObjectMapper().readValue(request.getInputStream(), LoginVO.class);
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(loginVO.getEmail(), loginVO.getPassword(), null);

            LocalDateTime currentTimeKST = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
            String formattedTime = currentTimeKST.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            log.info("Try login for email: {} at {}", loginVO.getEmail(), formattedTime);

            return authenticationManager.authenticate(authToken);

        } catch (IOException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException, ServletException {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String username = customUserDetails.getUsername();
        String name = customUserDetails.getName();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();

        UserRole role = UserRole.valueOf(auth.getAuthority());

        String token = jwtUtil.createJwt(username, role, name);

        response.addHeader("Authorization", "Bearer " + token);
        response.addHeader("UserRole", role.name());

        LocalDateTime currentTimeKST = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        String formattedTime = currentTimeKST.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        log.info("Successful login for email: {} at {}", username, formattedTime);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        response.setStatus(401);
    }

    @Getter
    public static class LoginVO {
        private String email;
        private String password;
    }
}
