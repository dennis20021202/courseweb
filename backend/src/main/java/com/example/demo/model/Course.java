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
    
    // --- UI 相關欄位 (Highlight 與 PromoText 仍屬業務邏輯，保留) ---
    
    private Boolean highlight; // 是否高亮顯示 (金色邊框)
    
    private String promoText; // 促銷文字 (e.g. 看完影片折價...)
    
    // 儲存課綱的 JSON 字串
    // 結構更新: Unit 新增 videoId 欄位
    @Column(columnDefinition = "TEXT")
    private String syllabusJson; 
}