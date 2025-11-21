package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_levels")
@Data
public class UserLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer level = 1;

    // 當前等級累積的經驗值 (例如: 剛升上 Lv2 時為 0)
    private Integer currentExp = 0;

    // 升到下一級所需的總經驗值 (例如: Lv1 -> Lv2 需要 100)
    private Integer nextLevelThreshold = 100;
}