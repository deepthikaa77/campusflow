package com.campusflow.repository;

import com.campusflow.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {
    boolean existsByCourseCode(String courseCode);
}
