package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;

    public GrievanceService(GrievanceRepository grievanceRepository, UserRepository userRepository,
                             SubjectRepository subjectRepository, NotificationService notificationService) {
        this.grievanceRepository = grievanceRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.notificationService = notificationService;
    }

    public Grievance create(GrievanceRequest req, User fromUser) {
        User toUser = userRepository.findById(req.getToUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        Grievance grievance = new Grievance();
        grievance.setTitle(req.getTitle());
        grievance.setDescription(req.getDescription());
        grievance.setFromUser(fromUser);
        grievance.setToUser(toUser);
        if (req.getSubjectId() != null)
            subjectRepository.findById(req.getSubjectId()).ifPresent(grievance::setSubject);
        grievanceRepository.save(grievance);
        notificationService.send("New Grievance: " + req.getTitle(), req.getDescription(), toUser.getId(), Notification.Type.GRIEVANCE);
        return grievance;
    }

    public List<Map<String, Object>> getSent(User user) {
        return grievanceRepository.findByFromUser_IdOrderByCreatedAtDesc(user.getId()).stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getReceived(User user) {
        return grievanceRepository.findByToUser_IdOrderByCreatedAtDesc(user.getId()).stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(Grievance g) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", g.getId());
        m.put("title", g.getTitle());
        m.put("description", g.getDescription());
        m.put("response", g.getResponse());
        m.put("status", g.getStatus());
        m.put("created_at", g.getCreatedAt());
        m.put("resolved_at", g.getResolvedAt());
        m.put("from_name", g.getFromUser().getName());
        m.put("to_name", g.getToUser().getName());
        if (g.getSubject() != null) m.put("subject_id", g.getSubject().getId());
        return m;
    }

    public Map<String, Object> respond(Long id, RespondRequest req) {
        Grievance grievance = grievanceRepository.findById(id).orElseThrow(() -> new RuntimeException("Grievance not found"));
        grievance.setResponse(req.getResponse());
        Grievance.Status status = req.getStatus() != null ? Grievance.Status.valueOf(req.getStatus()) : Grievance.Status.IN_PROGRESS;
        grievance.setStatus(status);
        if (status == Grievance.Status.RESOLVED) grievance.setResolvedAt(LocalDateTime.now());
        grievanceRepository.save(grievance);
        notificationService.send("Grievance Updated: " + grievance.getTitle(), req.getResponse(), grievance.getFromUser().getId(), Notification.Type.GRIEVANCE);
        return toMap(grievance);
    }
}
