package com.example.demo.controller;

import com.example.demo.model.Course;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;

    private User getUserByToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.replace("Bearer ", "");
        return userRepository.findByToken(token).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> body) {
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        // 從 Request Body 讀取所有資料
        Object courseIdObj = body.get("courseId");
        Long courseId = courseIdObj instanceof Integer ? ((Integer) courseIdObj).longValue() : (Long) courseIdObj;
        
        String paymentMethod = (String) body.get("paymentMethod");
        String invoiceType = (String) body.get("invoiceType");
        String invoiceCarrier = (String) body.get("invoiceCarrier");

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.badRequest().body("課程不存在");

        Order order = new Order();
        order.setUser(user);
        order.setCourse(course);
        order.setStatus("PAID");
        
        // 寫入發票與付款資訊
        order.setPaymentMethod(paymentMethod);
        order.setInvoiceType(invoiceType);
        order.setInvoiceCarrier(invoiceCarrier);
        
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String token) {
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("無權限操作");
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }
}