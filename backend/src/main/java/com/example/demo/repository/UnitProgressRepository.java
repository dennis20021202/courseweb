package com.example.demo.repository;

import com.example.demo.model.UnitProgress;
import com.example.demo.model.User;
import com.example.demo.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UnitProgressRepository extends JpaRepository<UnitProgress, Long> {
    // 查詢使用者在某堂課的所有單元進度
    List<UnitProgress> findByUserAndCourse(User user, Course course);
    
    // 查詢特定單元的進度
    Optional<UnitProgress> findByUserAndCourseAndUnitId(User user, Course course, String unitId);
}