package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.video.upload-dir:/shared/videos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 確保路徑以 / 結尾
        String path = uploadDir.endsWith(File.separator) ? uploadDir : uploadDir + File.separator;

        // 設定資源對映
        // 請求網址: http://backend-url/videos/demo.mp4
        // 實際檔案: /shared/videos/demo.mp4
        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + path);
    }
}