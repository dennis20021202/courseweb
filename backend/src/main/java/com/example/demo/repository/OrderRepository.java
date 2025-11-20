package com.example.demo.repository;

import com.example.demo.model.Course;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // 檢查是否有特定狀態的訂單 (用於檢查是否已購買，或是否有待付款訂單)
    Optional<Order> findByUserAndCourseAndStatus(User user, Course course, String status);
    
    boolean existsByUserAndCourseAndStatus(User user, Course course, String status);
}