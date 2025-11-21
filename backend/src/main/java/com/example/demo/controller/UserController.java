package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserLevel;
import com.example.demo.repository.UserLevelRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLevelRepository userLevelRepository;

    private User getUserByToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.replace("Bearer ", "");
        return userRepository.findByToken(token).orElse(null);
    }

    // 獲取個人等級資訊
    @GetMapping("/level")
    public ResponseEntity<?> getUserLevel(@RequestHeader("Authorization") String token) {
        User user = getUserByToken(token);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        UserLevel userLevel = userLevelRepository.findByUser(user).orElseGet(() -> {
            // 如果沒有資料 (例如舊帳號)，即時建立一個
            UserLevel level = new UserLevel();
            level.setUser(user);
            level.setLevel(1);
            level.setCurrentExp(0);
            level.setNextLevelThreshold(100);
            return userLevelRepository.save(level);
        });

        return ResponseEntity.ok(userLevel);
    }
}