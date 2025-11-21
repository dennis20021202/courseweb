package com.example.demo.repository;

import com.example.demo.model.User;
import com.example.demo.model.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    Optional<UserLevel> findByUser(User user);
}