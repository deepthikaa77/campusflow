package com.campusflow.repository;

import com.campusflow.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByFromUser_IdOrderByCreatedAtDesc(Long userId);
    List<Grievance> findByToUser_IdOrderByCreatedAtDesc(Long userId);
    long countByToUser_IdAndStatus(Long userId, Grievance.Status status);
}
