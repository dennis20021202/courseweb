package com.example.demo;

import com.example.demo.model.Course;
import com.example.demo.model.User;
import com.example.demo.model.UserLevel;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UserLevelRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLevelRepository userLevelRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. 初始化課程 (加入 exp 欄位)
        if (courseRepository.count() == 0) {
            // --- 課程 1 ---
            Course c1 = new Course();
            c1.setTitle("軟體設計模式精通之旅");
            c1.setAuthor("水球潘");
            c1.setDescription("用一趟旅程的時間，成為硬核的 Coding 實戰高手。");
            c1.setLongDescription("這是一趟深入軟體設計模式的旅程...");
            c1.setImage("/images/course_0.png");
            c1.setPrice(3990);
            c1.setOriginalPrice(6990);
            c1.setTags("設計模式,架構設計");
            c1.setHighlight(true);
            c1.setPromoText("看完課程介紹，立刻折價 3,000 元");
            c1.setRecommended(true);
            c1.setHasTrial(true);

            // 在 JSON 中加入 "exp": 100
            String syllabus1 = "[" +
                    "{" +
                    "\"id\": \"c1\", " +
                    "\"title\": \"啟程：物件導向基礎\", " +
                    "\"units\": [" +
                    "{\"id\": \"c1-u1\", \"title\": \"單元 1：物件導向思維 (試聽)\", \"videoId\": \"c101\", \"exp\": 100}," +
                    "{\"id\": \"c1-u2\", \"title\": \"單元 2：封裝、繼承、多型\", \"videoId\": \"c102\", \"exp\": 100}," +
                    "{\"id\": \"c1-u3\", \"title\": \"單元 3：介面與抽象類別\", \"videoId\": \"c103\", \"exp\": 150}" +
                    "]" +
                    "}" +
                    "]";
            c1.setSyllabusJson(syllabus1);
            courseRepository.save(c1);

            // --- 課程 2 ---
            Course c2 = new Course();
            c2.setTitle("AI x BDD：規格驅動全自動開發術");
            c2.setAuthor("水球潘");
            c2.setDescription("AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發。");
            c2.setLongDescription("這門課程要帶你...");
            c2.setImage("/images/course_4.png");
            c2.setPrice(7599);
            c2.setOriginalPrice(15999);
            c2.setTags("AI,BDD,Cucumber");
            c2.setRecommended(true);
            c2.setHasTrial(false);

            String syllabus2 = "[" +
                    "{" +
                    "\"id\": \"ch1\", \"title\": \"規格驅動開發的前提\", \"date\": \"2025/09/29\", " +
                    "\"units\": [" +
                    "{\"id\": \"ch1-u1\", \"title\": \"單元 1：為什麼需要規格驅動？\", \"videoId\": \"ch101\", \"exp\": 100}," +
                    "{\"id\": \"ch1-u2\", \"title\": \"單元 2：環境建置與工具介紹\", \"videoId\": \"ch102\", \"exp\": 100}," +
                    "{\"id\": \"ch1-u3\", \"title\": \"單元 3：第一個 BDD 案例\", \"videoId\": \"ch103\", \"exp\": 200}" +
                    "]" +
                    "}," +
                    "{" +
                    "\"id\": \"ch2\", \"title\": \"100% 全自動化開發的脈絡：規格的光譜\", \"date\": \"2025/10/27\", " +
                    "\"units\": [" +
                    "{\"id\": \"ch2-u1\", \"title\": \"單元 1：規格光譜解析\", \"videoId\": \"ch201\", \"exp\": 100}," +
                    "{\"id\": \"ch2-u2\", \"title\": \"單元 2：從自然語言到可執行規格\", \"videoId\": \"ch202\", \"exp\": 100}," +
                    "{\"id\": \"ch2-u3\", \"title\": \"單元 3：案例實作\", \"videoId\": \"ch203\", \"exp\": 300}" +
                    "]" +
                    "}" +
                    "]";
            c2.setSyllabusJson(syllabus2);
            courseRepository.save(c2);

            System.out.println("--- 課程資料初始化完成 (Added EXP) ---");
        }

        // 2. 確保所有現有使用者都有 UserLevel
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (userLevelRepository.findByUser(user).isEmpty()) {
                UserLevel level = new UserLevel();
                level.setUser(user);
                level.setLevel(1);
                level.setCurrentExp(0);
                level.setNextLevelThreshold(100);
                userLevelRepository.save(level);
                System.out.println("Created UserLevel for user: " + user.getEmail());
            }
        }
    }
}