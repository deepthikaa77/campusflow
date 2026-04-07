package com.campusflow.repository;

import com.campusflow.model.Notification;
import com.campusflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
    long countByUser_IdAndIsReadFalse(Long userId);
    long countByUserAndIsRead(User user, Boolean isRead);
}
