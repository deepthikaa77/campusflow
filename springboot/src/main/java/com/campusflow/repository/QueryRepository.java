package com.campusflow.repository;

import com.campusflow.model.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QueryRepository extends JpaRepository<Query, Long> {
    List<Query> findByFromUser_IdOrderByCreatedAtDesc(Long userId);
    List<Query> findByToUser_IdOrderByCreatedAtDesc(Long userId);
}
