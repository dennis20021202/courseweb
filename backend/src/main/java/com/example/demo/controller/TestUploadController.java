package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test/upload")
@CrossOrigin(origins = "*")
public class TestUploadController {

    @Value("${app.video.upload-dir:/shared/videos}")
    private String uploadDir;

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file,
            @RequestParam("fileName") String fileName) {

        // ... (前面的檢查邏輯保持不變) ...
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().body("不合法的檔名");
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("檔案是空的");
        }

        try {
            Path directoryPath = Paths.get(uploadDir);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            String saveName = fileName;
            if (!saveName.toLowerCase().endsWith(".mp4")) {
                saveName += ".mp4";
            }

            Path filePath = directoryPath.resolve(saveName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Map<String, String> response = new HashMap<>();
            response.put("message", "上傳成功");

            // [修改重點] 這裡不需要回傳完整路徑，只要回傳檔名即可，前端會自己組裝 URL
            // 或者回傳後端的資源路徑
            response.put("path", "/videos/" + saveName);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("上傳失敗: " + e.getMessage());
        }
    }
}