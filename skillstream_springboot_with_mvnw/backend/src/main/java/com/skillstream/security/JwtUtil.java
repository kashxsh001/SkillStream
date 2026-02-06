package com.skillstream.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class JwtUtil {
    private static final String secret = System.getenv().getOrDefault("JWT_SECRET", "change_this_secret_for_prod");
    private static final long expiration = Long.parseLong(System.getenv().getOrDefault("JWT_EXPIRATION_MS","86400000"));

    private static SecretKey getKey() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            // Fallback to direct bytes (should not happen on standard JVMs)
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }

    public static String generateToken(String subject) {
        SecretKey key = getKey();
        return Jwts.builder()
            .setSubject(subject)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis()+expiration))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public static String generateToken(String subject, String role) {
        SecretKey key = getKey();
        return Jwts.builder()
            .setSubject(subject)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis()+expiration))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public static String parseSubject(String token) {
        if (token == null || token.isBlank()) return null;
        String raw = token.startsWith("Bearer ") ? token.substring(7) : token;
        try {
            SecretKey key = getKey();
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(raw)
                    .getBody()
                    .getSubject();
        } catch (Exception ex) {
            return null;
        }
    }
}