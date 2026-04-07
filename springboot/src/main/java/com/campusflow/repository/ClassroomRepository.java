package com.campusflow.repository;

import com.campusflow.model.Classroom;
import com.campusflow.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, String> {
    Optional<Classroom> findByTutor(Staff tutor);
}
