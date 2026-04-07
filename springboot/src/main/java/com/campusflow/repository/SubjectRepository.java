package com.campusflow.repository;

import com.campusflow.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByClassroom_ClassId(String classId);
    List<Subject> findByStaff_StaffId(String staffId);
}
