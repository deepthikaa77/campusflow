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
public class QueryService {

    private final QueryRepository queryRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;

    public QueryService(QueryRepository queryRepository, UserRepository userRepository,
                        SubjectRepository subjectRepository, NotificationService notificationService) {
        this.queryRepository = queryRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.notificationService = notificationService;
    }

    public Map<String, Object> create(QueryRequest req, User fromUser) {
        User toUser = userRepository.findById(req.getToUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        Query query = new Query();
        query.setTitle(req.getTitle());
        query.setMessage(req.getMessage());
        query.setFromUser(fromUser);
        query.setToUser(toUser);
        if (req.getSubjectId() != null)
            subjectRepository.findById(req.getSubjectId()).ifPresent(query::setSubject);
        queryRepository.save(query);
        notificationService.send("New Query: " + req.getTitle(), req.getMessage(), toUser.getId(), Notification.Type.QUERY);
        return toMap(query);
    }

    public List<Map<String, Object>> getSent(User user) {
        return queryRepository.findByFromUser_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getReceived(User user) {
        return queryRepository.findByToUser_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(Query q) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", q.getId());
        m.put("title", q.getTitle());
        m.put("message", q.getMessage());
        m.put("response", q.getResponse());
        m.put("status", q.getStatus());
        m.put("created_at", q.getCreatedAt());
        m.put("responded_at", q.getRespondedAt());
        m.put("from_name", q.getFromUser().getName());
        m.put("to_name", q.getToUser().getName());
        m.put("to_user_id", q.getToUser().getId());
        return m;
    }

    public Map<String, Object> respond(Long id, RespondRequest req, User responder) {
        Query query = queryRepository.findById(id).orElseThrow(() -> new RuntimeException("Query not found"));
        query.setResponse(req.getResponse());
        query.setStatus(Query.Status.RESPONDED);
        query.setRespondedAt(LocalDateTime.now());
        queryRepository.save(query);
        notificationService.send("Query Responded: " + query.getTitle(), req.getResponse(), query.getFromUser().getId(), Notification.Type.QUERY);
        return toMap(query);
    }

    public Map<String, Object> close(Long id, User user) {
        Query query = queryRepository.findById(id).orElseThrow(() -> new RuntimeException("Query not found"));
        query.setStatus(Query.Status.CLOSED);
        return toMap(queryRepository.save(query));
    }
}
