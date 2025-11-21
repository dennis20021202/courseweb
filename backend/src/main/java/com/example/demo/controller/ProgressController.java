package com.example.demo.controller;

import com.example.demo.model.Course;
import com.example.demo.model.UnitProgress;
import com.example.demo.model.User;
import com.example.demo.model.UserLevel;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UnitProgressRepository;
import com.example.demo.repository.UserLevelRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    @Autowired
    private UserLevelRepository userLevelRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User getUserByToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.replace("Bearer ", "");
        return userRepository.findByToken(token).orElse(null);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<?> getCourseProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId) {

        User user = getUserByToken(token);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null)
            return ResponseEntity.notFound().build();

        List<UnitProgress> progressList = progressRepository.findByUserAndCourse(user, course);
        return ResponseEntity.ok(progressList);
    }

    @PostMapping("/courses/{courseId}/units/{unitId}")
    public ResponseEntity<?> updateProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId,
            @PathVariable String unitId,
            @RequestBody Map<String, Object> body) {

        User user = getUserByToken(token);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null)
            return ResponseEntity.notFound().build();

        Integer position = (Integer) body.getOrDefault("position", 0);
        Integer progress = (Integer) body.getOrDefault("progress", 0);
        if (progress > 100)
            progress = 100;

        UnitProgress unitProgress = progressRepository
                .findByUserAndCourseAndUnitId(user, course, unitId)
                .orElse(new UnitProgress());

        if (unitProgress.getId() == null) {
            unitProgress.setUser(user);
            unitProgress.setCourse(course);
            unitProgress.setUnitId(unitId);
        }

        unitProgress.setLastPositionSeconds(position);

        if (unitProgress.getProgressPercent() < progress) {
            unitProgress.setProgressPercent(progress);
        }

        if (progress >= 100 && !unitProgress.getCompleted()) {
            unitProgress.setCompleted(true);
            unitProgress.setProgressPercent(100);
        }

        progressRepository.save(unitProgress);
        return ResponseEntity.ok(unitProgress);
    }

    // --- 新增：交付單元 (獲取經驗值) ---
    @PostMapping("/courses/{courseId}/units/{unitId}/deliver")
    public ResponseEntity<?> deliverUnit(
            @RequestHeader("Authorization") String token,
            @PathVariable Long courseId,
            @PathVariable String unitId) {

        User user = getUserByToken(token);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null)
            return ResponseEntity.notFound().build();

        // 1. 檢查權限：必須已購買 (體驗課程不可獲取經驗值)
        boolean isPurchased = orderRepository.existsByUserAndCourseAndStatus(user, course, "PAID");
        if (!isPurchased) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("體驗模式無法交付單元，請先購買課程");
        }

        // 2. 檢查進度
        UnitProgress progress = progressRepository.findByUserAndCourseAndUnitId(user, course, unitId)
                .orElse(null);

        if (progress == null || !progress.getCompleted()) {
            return ResponseEntity.badRequest().body("單元尚未完成，無法交付");
        }

        if (progress.getDelivered()) {
            return ResponseEntity.badRequest().body("此單元已交付過");
        }

        // 3. 解析單元經驗值
        int expToGain = 100; // 預設
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(course.getSyllabusJson());
            // 遍歷章節尋找單元
            for (JsonNode chapter : root) {
                if (chapter.has("units")) {
                    for (JsonNode unit : chapter.get("units")) {
                        if (unit.has("id") && unit.get("id").asText().equals(unitId)) {
                            if (unit.has("exp")) {
                                expToGain = unit.get("exp").asInt();
                            }
                            break;
                        }
                    }
                }
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace(); // Log error but continue with default EXP
        }

        // 4. 更新使用者經驗值與等級
        UserLevel userLevel = userLevelRepository.findByUser(user).orElseGet(() -> {
            UserLevel ul = new UserLevel();
            ul.setUser(user);
            ul.setLevel(1);
            ul.setCurrentExp(0);
            ul.setNextLevelThreshold(100);
            return userLevelRepository.save(ul);
        });

        userLevel.setCurrentExp(userLevel.getCurrentExp() + expToGain);

        boolean leveledUp = false;
        // 升級邏輯：當前經驗 >= 門檻時升級
        while (userLevel.getCurrentExp() >= userLevel.getNextLevelThreshold()) {
            userLevel.setCurrentExp(userLevel.getCurrentExp() - userLevel.getNextLevelThreshold());
            userLevel.setLevel(userLevel.getLevel() + 1);
            // 門檻變為原來的 1.5 倍 (取整數)
            userLevel.setNextLevelThreshold((int) (userLevel.getNextLevelThreshold() * 1.5));
            leveledUp = true;
        }

        userLevelRepository.save(userLevel);

        // 5. 標記為已交付
        progress.setDelivered(true);
        progressRepository.save(progress);

        // 6. 回傳結果
        Map<String, Object> result = new HashMap<>();
        result.put("expGained", expToGain);
        result.put("leveledUp", leveledUp);
        result.put("newLevel", userLevel.getLevel());
        result.put("currentExp", userLevel.getCurrentExp());
        result.put("nextLevelThreshold", userLevel.getNextLevelThreshold());

        return ResponseEntity.ok(result);
    }
}