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
    
    // --- 為了還原前端設計稿新增的欄位 ---
    
    private Boolean highlight; // 是否高亮顯示 (金色邊框)
    
    private String promoText; // 促銷文字 (e.g. 看完影片折價...)
    
    private String buttonText; // 按鈕文字 (e.g. 立刻體驗 / 立刻購買)
    
    private String buttonStyle; // "solid" 或 "outline"
    
    // 儲存課綱的 JSON 字串。
    // 因為課綱結構較複雜 (章節->單元)，為了面試速度，我們直接存成 JSON 字串，前端收到後 JSON.parse 即可。
    @Column(columnDefinition = "TEXT")
    private String syllabusJson; 
}