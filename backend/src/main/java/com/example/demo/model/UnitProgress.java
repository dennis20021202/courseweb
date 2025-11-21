package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "unit_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "course_id", "unitId" })
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

    @Column(nullable = false)
    private String unitId;

    private Integer progressPercent = 0;

    private Integer lastPositionSeconds = 0;

    private Boolean completed = false;

    // 新增：是否已交付 (已領取經驗值)
    private Boolean delivered = false;

    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}