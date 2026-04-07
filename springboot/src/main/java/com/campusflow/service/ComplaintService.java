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
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final StaffRepository staffRepository;
    private final NotificationService notificationService;

    public ComplaintService(ComplaintRepository complaintRepository, StudentRepository studentRepository,
                            ClassroomRepository classroomRepository, StaffRepository staffRepository,
                            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.staffRepository = staffRepository;
        this.notificationService = notificationService;
    }

    public Map<String, Object> create(ComplaintRequest req, User fromUser) {
        // If student, auto-detect classId from their student record
        String classId = req.getClassId();
        if (fromUser.getRole() == User.Role.STUDENT && (classId == null || classId.isBlank())) {
            classId = studentRepository.findByUser(fromUser)
                .map(s -> s.getClassroom().getClassId())
                .orElseThrow(() -> new RuntimeException("Student record not found"));
        }
        Classroom classroom = classroomRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));
        Complaint complaint = new Complaint();
        complaint.setTitle(req.getTitle());
        complaint.setDescription(req.getDescription());
        complaint.setFromUser(fromUser);
        complaint.setClassroom(classroom);
        if (req.getAboutStudentId() != null)
            studentRepository.findById(req.getAboutStudentId()).ifPresent(complaint::setAboutStudent);
        complaintRepository.save(complaint);
        Staff tutor = classroom.getTutor();
        if (tutor.getUser() != null)
            notificationService.send("New Complaint: " + req.getTitle(), req.getDescription(), tutor.getUser().getId(), Notification.Type.COMPLAINT);
        return toMap(complaint);
    }

    public List<Map<String, Object>> getMyComplaints(User user) {
        return complaintRepository.findByFromUser_IdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getMyClassComplaints(User user) {
        return staffRepository.findByUser(user)
            .flatMap(classroomRepository::findByTutor)
            .map(c -> getClassComplaints(c.getClassId()))
            .orElse(List.of());
    }

    public List<Map<String, Object>> getClassComplaints(String classId) {
        return complaintRepository.findByClassroom_ClassIdOrderByCreatedAtDesc(classId)
            .stream().map(this::toMap).toList();
    }

    public Map<String, Object> respond(Long id, RespondRequest req) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setResponse(req.getResponse());
        complaint.setStatus(Complaint.Status.RESPONDED);
        complaint.setRespondedAt(LocalDateTime.now());
        complaintRepository.save(complaint);
        notificationService.send("Complaint Responded: " + complaint.getTitle(), req.getResponse(), complaint.getFromUser().getId(), Notification.Type.COMPLAINT);
        return toMap(complaint);
    }

    private Map<String, Object> toMap(Complaint c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("title", c.getTitle());
        m.put("description", c.getDescription());
        m.put("response", c.getResponse());
        m.put("status", c.getStatus());
        m.put("created_at", c.getCreatedAt());
        m.put("responded_at", c.getRespondedAt());
        m.put("from_name", c.getFromUser().getName());
        m.put("from_role", c.getFromUser().getRole());
        m.put("class_id", c.getClassroom().getClassId());
        m.put("class_name", c.getClassroom().getClassName());
        if (c.getAboutStudent() != null) m.put("about_student", c.getAboutStudent().getName());
        return m;
    }
}
