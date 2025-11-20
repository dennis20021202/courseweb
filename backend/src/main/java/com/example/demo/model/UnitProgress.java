package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "unit_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "course_id", "unitId"})
})
@Data
public class UnitProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // 對應 JSON 課綱中的 unit.id (例如 "u1", "1-1")
    @Column(nullable = false)
    private String unitId;

    // 觀看進度百分比 (0-100)
    private Integer progressPercent = 0;

    // 上次觀看的時間點 (秒)
    private Integer lastPositionSeconds = 0;

    // 是否已完成 (100% 或手動交付)
    private Boolean completed = false;

    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}