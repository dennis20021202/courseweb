package com.example.demo.controller;

import com.example.demo.model.Course;
import com.example.demo.model.UnitProgress;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UnitProgressRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    @Autowired
    private UnitProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    // 輔助方法：驗證 Token
    private User getUserByToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.replace("Bearer ", "");
        return userRepository.findByToken(token).orElse(null);
    }

    // 1. 獲取某堂課的所有單元進度
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<?> getCourseProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId) {
        
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();

        List<UnitProgress> progressList = progressRepository.findByUserAndCourse(user, course);
        return ResponseEntity.ok(progressList);
    }

    // 2. 更新單元進度 (Heartbeat)
    @PostMapping("/courses/{courseId}/units/{unitId}")
    public ResponseEntity<?> updateProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId,
            @PathVariable String unitId,
            @RequestBody Map<String, Object> body) {
        
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.notFound().build();

        // 讀取請求資料
        Integer position = (Integer) body.getOrDefault("position", 0);
        Integer progress = (Integer) body.getOrDefault("progress", 0);
        // 確保不超過 100%
        if (progress > 100) progress = 100;

        // 查找或建立新的進度紀錄
        UnitProgress unitProgress = progressRepository
                .findByUserAndCourseAndUnitId(user, course, unitId)
                .orElse(new UnitProgress());

        if (unitProgress.getId() == null) {
            unitProgress.setUser(user);
            unitProgress.setCourse(course);
            unitProgress.setUnitId(unitId);
        }

        // 更新邏輯
        unitProgress.setLastPositionSeconds(position);
        
        // 只有當新進度大於舊進度時才更新 (避免往回拉導致進度倒退)
        if (unitProgress.getProgressPercent() < progress) {
            unitProgress.setProgressPercent(progress);
        }

        // 自動判定完成 (例如超過 95% 視為 100%)
        if (progress >= 100 && !unitProgress.getCompleted()) {
            unitProgress.setCompleted(true);
            unitProgress.setProgressPercent(100);
        }

        progressRepository.save(unitProgress);
        return ResponseEntity.ok(unitProgress);
    }
}