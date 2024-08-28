package org.jiwoo.back.config;

import jakarta.servlet.http.HttpServletRequest;
import org.jiwoo.back.common.filter.JwtFilter;
import org.jiwoo.back.common.filter.LoginFilter;
import org.jiwoo.back.common.util.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;

    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {

        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();

        hierarchy.setHierarchy("ROLE_ADMIN > ROLE_MANAGER\n" + "ROLE_MANAGER > ROLE_NORMAL");

        return hierarchy;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // CORS 설정
        http.cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {

                List<String> allowStringList = Collections.singletonList("*");
                List<String> exposedHeaders = List.of("Authorization", "UserRole");
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOriginPatterns(allowStringList);
                configuration.setAllowedMethods(allowStringList);
                configuration.setAllowedHeaders(allowStringList);
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);
                configuration.setExposedHeaders(exposedHeaders);

                return configuration;
            }
        }));

        // csrf disable
        http.csrf(AbstractHttpConfigurer::disable);

        // Form 로그인 방식 disable
        http.formLogin(AbstractHttpConfigurer::disable);

        // http basic 인증 방식 disable
        http.httpBasic(AbstractHttpConfigurer::disable);

        // 경로별 인가 작업
        http.authorizeHttpRequests((auth) -> auth
                .requestMatchers("/**").permitAll()
                .anyRequest().authenticated());

        // JWT 필터
        http.addFilterBefore(new JwtFilter(jwtUtil), LoginFilter.class);

        // 로그인 필터
        http.addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil),
                UsernamePasswordAuthenticationFilter.class);

        // 세션 설정
        http.sessionManagement((session) -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
