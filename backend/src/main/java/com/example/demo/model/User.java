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

    // 修改這裡：使用 @Column(columnDefinition = "TEXT") 來支援長字串
    // 或者使用 @Lob (但在某些 DB 可能需要額外設定，TEXT 對 PostgreSQL 來說最簡單)
    @Column(columnDefinition = "TEXT")
    private String avatar;
}