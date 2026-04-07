package com.campusflow.repository;

import com.campusflow.model.Student;
import com.campusflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findByClassroom_ClassId(String classId);
    Optional<Student> findByUser(User user);
}
