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

    // 從環境變數或 application.properties 讀取路徑
    // 在 docker-compose 中我們設定為 /shared/videos
    @Value("${app.video.upload-dir:/shared/videos}")
    private String uploadDir;

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file,
            @RequestParam("fileName") String fileName) {
        // 簡單的安全檢查，防止上傳到父目錄
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().body("不合法的檔名");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("檔案是空的");
        }

        try {
            // 1. 確保目錄存在
            Path directoryPath = Paths.get(uploadDir);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);

                // 嘗試設定目錄權限，讓其他使用者也能讀寫 (解決 Docker 權限問題)
                File dir = directoryPath.toFile();
                dir.setReadable(true, false); // Owner only = false (all can read)
                dir.setWritable(true, false);
                dir.setExecutable(true, false);
            }

            // 2. 確保檔名以 .mp4 結尾
            String saveName = fileName;
            if (!saveName.toLowerCase().endsWith(".mp4")) {
                saveName += ".mp4";
            }

            // 3. 儲存檔案
            Path filePath = directoryPath.resolve(saveName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 4. 設定檔案權限 (關鍵：確保前端容器可以讀取)
            File savedFile = filePath.toFile();
            savedFile.setReadable(true, false); // 全域可讀
            savedFile.setWritable(true, true); // 僅擁有者可寫

            Map<String, String> response = new HashMap<>();
            response.put("message", "上傳成功");
            response.put("path", "/videos/" + saveName);
            response.put("realPath", filePath.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("上傳失敗: " + e.getMessage());
        }
    }
}