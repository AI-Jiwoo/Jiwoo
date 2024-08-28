package org.jiwoo.back.common.filter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jiwoo.back.common.util.JwtUtil;
import org.jiwoo.back.user.aggregate.entity.User;
import org.jiwoo.back.user.aggregate.enums.UserRole;
import org.jiwoo.back.user.dto.CustomUserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        //request에서 Authorization 헤더를 찾음
        String authorization = request.getHeader("Authorization");

        // 로그용 변수
        String currentTime = LocalDateTime.now().format(formatter);
        String httpMethod = request.getMethod();
        String requestUri = request.getRequestURI();

        //Authorization 헤더 검증
        if (authorization == null || !authorization.startsWith("Bearer ")) {

            log.info("Access without token: HTTP Method = {}, URI = {}", httpMethod, requestUri);
            filterChain.doFilter(request, response);

            return;
        }

        log.info("Access with token: HTTP Method = {}, URI = {}", httpMethod, requestUri);

        //Bearer 부분 제거 후 순수 토큰만 획득
        String token = authorization.split(" ")[1];

        try {

            //토큰 소멸 시간 검증
            if (jwtUtil.isExpired(token)) {

                System.out.println("token expired");
                filterChain.doFilter(request, response);

                //조건이 해당되면 메소드 종료 (필수)
                return;
            }

            //토큰에서 username과 role 획득
            String email = jwtUtil.getEmail(token);
            UserRole role = UserRole.valueOf(jwtUtil.getRole(token));
            String name = jwtUtil.getName(token);

            //userEntity를 생성하여 값 set
            User userEntity = User.builder()
                    .email(email)
                    .password("temp_password")
                    .name(name)
                    .userRole(role)
                    .build();

            // UserDetails에 회원 정보 객체 담기
            CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);

            // 스프링 시큐리티 인증 토큰 생성
            Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

            //세션에 사용자 등록
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (JwtException e) {
            log.error("Invalid JWT token: {}, HTTP Method = {}, URI = {}, Time = {}", e.getMessage(), httpMethod, requestUri, currentTime);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        } catch (Exception e) {
            log.error("Unexpected error: {}, HTTP Method = {}, URI = {}, Time = {}", e.getMessage(), httpMethod, requestUri, currentTime);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
