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

    // 建立訂單 (或取得既有的待付款訂單)
    // 觸發時機：使用者在 Modal 第一步按下 "下一步" 時
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> body) {
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Object courseIdObj = body.get("courseId");
        Long courseId = courseIdObj instanceof Integer ? ((Integer) courseIdObj).longValue() : (Long) courseIdObj;
        
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return ResponseEntity.badRequest().body("課程不存在");

        // 1. 檢查是否已經購買過 (PAID)
        if (orderRepository.existsByUserAndCourseAndStatus(user, course, "PAID")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("您已購買此課程，請直接去上課");
        }

        // 2. 檢查是否有「待付款 (PENDING)」的訂單
        Optional<Order> pendingOrder = orderRepository.findByUserAndCourseAndStatus(user, course, "PENDING");
        if (pendingOrder.isPresent()) {
            // 如果有，直接回傳該訂單 (斷點續購)
            return ResponseEntity.ok(pendingOrder.get());
        }

        // 3. 建立新的待付款訂單
        Order order = new Order();
        order.setUser(user);
        order.setCourse(course);
        order.setStatus("PENDING"); // 初始狀態
        
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    // 完成付款
    // 觸發時機：使用者在 Modal 第二步按下 "進行支付" 時
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payOrder(@RequestHeader("Authorization") String token, 
                                      @PathVariable Long id, 
                                      @RequestBody Map<String, String> body) {
        User user = getUserByToken(token);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        
        // 安全性檢查：確保訂單屬於該使用者
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("無權限操作此訂單");
        }

        // 寫入付款資訊
        order.setPaymentMethod(body.get("paymentMethod"));
        order.setInvoiceType(body.get("invoiceType"));
        order.setInvoiceCarrier(body.get("invoiceCarrier"));
        
        // 變更狀態為已付款
        order.setStatus("PAID");
        
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