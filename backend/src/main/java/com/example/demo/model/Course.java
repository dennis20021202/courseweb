package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String longDescription;

    private String image;
    private Integer price;
    private Integer originalPrice;

    private String tags; // 逗號分隔

    private Boolean highlight; // 是否高亮顯示 (金色邊框)

    private String promoText; // 促銷文字

    // --- 新增欄位 ---

    // 是否為推薦課程 (首頁只顯示這個)
    private Boolean recommended = false;

    // 是否開放試聽 (未購買可看第一章第一節)
    private Boolean hasTrial = false;

    @Column(columnDefinition = "TEXT")
    private String syllabusJson;
}