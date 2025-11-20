package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String role = "STUDENT";

    @Column(columnDefinition = "TEXT")
    private String avatar;
    
    // 新增 Token 欄位，用於簡易驗證 (取代 Session/JWT 複雜設定)
    private String token;
}