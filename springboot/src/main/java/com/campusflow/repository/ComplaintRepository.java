package com.campusflow.repository;

import com.campusflow.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByFromUser_IdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findByClassroom_ClassIdOrderByCreatedAtDesc(String classId);
    long countByClassroom_ClassIdAndStatus(String classId, Complaint.Status status);
}
