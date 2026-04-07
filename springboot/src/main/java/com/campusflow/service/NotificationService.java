package com.campusflow.service;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void send(String title, String message, Long userId, Notification.Type type) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification n = new Notification();
            n.setTitle(title);
            n.setMessage(message);
            n.setUser(user);
            n.setType(type);
            notificationRepository.save(n);
        });
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    public Map<String, Long> getUnreadCount(User user) {
        return Map.of("count", notificationRepository.countByUser_IdAndIsReadFalse(user.getId()));
    }

    public void markAsRead(Long id, User user) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
            .stream().filter(n -> !n.getIsRead()).toList();
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
