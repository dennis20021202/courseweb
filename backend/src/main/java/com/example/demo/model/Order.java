package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
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
    private String status; // PENDING, PAID, CANCELLED

    // --- 新增發票相關欄位 ---
    private String paymentMethod; // CREDIT, ATM, INSTALLMENT
    
    private String invoiceType; // GUI(統編), MOBILE(載具), CITIZEN(自然人), DONATION(捐贈)
    
    private String invoiceCarrier; // 載具號碼 / 統編 / 捐贈碼
    
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}