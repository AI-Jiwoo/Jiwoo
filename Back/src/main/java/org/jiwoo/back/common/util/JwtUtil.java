package org.jiwoo.back.common.util;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import org.jiwoo.back.user.aggregate.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Objects;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final Long expiredMs;

    @Autowired
    public JwtUtil(Environment env) {
        this.secretKey = new SecretKeySpec(
                Objects.requireNonNull(env.getProperty("token.secret")).getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm());
        this.expiredMs = Long.valueOf(Objects.requireNonNull(env.getProperty("token.expiration_time")));
    }

    public String getEmail(String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("email", String.class);
    }

    public String getRole(String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("role", String.class);
    }

    public String getName(String token) {

        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().get("name", String.class);
    }

    public Boolean isExpired(String token) {

        try {
            return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public String createJwt(String email, UserRole role, String name) {

        return Jwts.builder()
                .claim("email", email)
                .claim("role", role)
                .claim("name", name)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
