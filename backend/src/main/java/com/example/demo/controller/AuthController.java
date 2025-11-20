package com.example.demo.controller;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setAvatar(request.getAvatar() != null ? request.getAvatar() : "/images/default-avatar.png");
        
        // 註冊後自動登入，生成 Token
        String token = UUID.randomUUID().toString();
        user.setToken(token);
        
        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getRole(), user.getAvatar()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(request.getPassword())) {
                // 每次登入更新 Token
                String token = UUID.randomUUID().toString();
                user.setToken(token);
                userRepository.save(user);
                
                return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getRole(), user.getAvatar()));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
    
    // 新增：透過 Token 獲取使用者資訊 (給前端 Profile 頁面用)
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String bearerToken) {
        String token = bearerToken.replace("Bearer ", "");
        Optional<User> userOpt = userRepository.findByToken(token);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(new AuthResponse(user.getToken(), user.getName(), user.getRole(), user.getAvatar()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}