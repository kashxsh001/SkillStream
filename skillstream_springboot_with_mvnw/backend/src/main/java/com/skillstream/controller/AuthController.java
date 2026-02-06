package com.skillstream.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.skillstream.repository.UserRepository;
import com.skillstream.model.User;
import com.skillstream.security.JwtUtil;
import java.util.Map;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepo){this.userRepo=userRepo;}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body){
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        if(email != null) email = email.trim().toLowerCase();
        if(name == null || email == null || password == null || name.isBlank() || email.isBlank() || password.isBlank()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg","Invalid payload"));
        }
        if(userRepo.findByEmail(email).isPresent()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg","Email already exists"));
        }
        User u = new User(); u.setName(name); u.setEmail(email); u.setPassword(encoder.encode(password));
        u.setRole("USER"); // Default role
        userRepo.save(u);
        String token = JwtUtil.generateToken(u.getEmail(), u.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("user", Map.of("name", u.getName(), "role", u.getRole()), "token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body){
        String email = body.get("email");
        String password = body.get("password");
        if(email != null) email = email.trim().toLowerCase();
        if(password == null || password.isBlank()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg","Password required"));
        }
        var opt = userRepo.findByEmail(email);
        if(opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","Invalid credentials"));
        User u = opt.get();
        // Handle null/legacy passwords gracefully
        String stored = u.getPassword();
        if(stored == null || stored.isBlank()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","Invalid credentials"));
        }
        // Primary: check bcrypt
        boolean ok;
        try {
            ok = encoder.matches(password, stored);
        } catch (Exception ex) {
            ok = false;
        }
        // Fallback: if legacy plaintext stored, upgrade to bcrypt on successful match
        if(!ok && password.equals(stored)){
            u.setPassword(encoder.encode(password));
            userRepo.save(u);
            ok = true;
        }
        if(!ok) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","Invalid credentials"));
        String token = JwtUtil.generateToken(u.getEmail(), u.getRole());
        return ResponseEntity.ok(Map.of("user", Map.of("name", u.getName(), "role", u.getRole()), "token", token));
    }
}