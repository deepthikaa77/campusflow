package com.campusflow.controller;

import com.campusflow.model.User;
import com.campusflow.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final NotificationRepository notificationRepository;
    private final ComplaintRepository complaintRepository;
    private final GrievanceRepository grievanceRepository;

    public DashboardController(UserRepository userRepository, StudentRepository studentRepository,
                               StaffRepository staffRepository, ClassroomRepository classroomRepository,
                               SubjectRepository subjectRepository, AttendanceRepository attendanceRepository,
                               MarksRepository marksRepository, NotificationRepository notificationRepository,
                               ComplaintRepository complaintRepository, GrievanceRepository grievanceRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.notificationRepository = notificationRepository;
        this.complaintRepository = complaintRepository;
        this.grievanceRepository = grievanceRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal User user) {
        Map<String, Object> stats = new HashMap<>();
        switch (user.getRole()) {
            case ADMIN -> {
                stats.put("totalUsers", userRepository.count());
                stats.put("totalStudents", studentRepository.count());
                stats.put("totalClassrooms", classroomRepository.count());
                stats.put("totalStaff", staffRepository.count());
                stats.put("unreadNotifications", notificationRepository.countByUserAndIsRead(user, false));
            }
            case STAFF -> {
                stats.put("totalUsers", userRepository.count());
                stats.put("totalStudents", studentRepository.count());
                stats.put("totalClassrooms", classroomRepository.count());
                stats.put("totalStaff", staffRepository.count());
                stats.put("unreadNotifications", notificationRepository.countByUserAndIsRead(user, false));
            }
            case TUTOR -> {
                staffRepository.findByUser(user).ifPresent(staff ->
                    classroomRepository.findByTutor(staff).ifPresent(classroom -> {
                        String classId = classroom.getClassId();
                        stats.put("className", classroom.getClassName());
                        stats.put("totalStudents", studentRepository.findByClassroom_ClassId(classId).size());
                        stats.put("totalSubjects", subjectRepository.findByClassroom_ClassId(classId).size());
                        stats.put("pendingComplaints", complaintRepository.countByClassroom_ClassIdAndStatus(classId, com.campusflow.model.Complaint.Status.PENDING));
                    })
                );
                stats.put("pendingGrievances", grievanceRepository.countByToUser_IdAndStatus(user.getId(), com.campusflow.model.Grievance.Status.PENDING));
                stats.put("unreadNotifications", notificationRepository.countByUserAndIsRead(user, false));
            }
            case STUDENT -> {
                studentRepository.findByUser(user).ifPresent(student -> {
                    String regNo = student.getRegisterNumber();
                    long total = attendanceRepository.countByStudent_RegisterNumber(regNo);
                    long present = attendanceRepository.countByStudent_RegisterNumberAndIsPresent(regNo, true);
                    double pct = total > 0 ? Math.round((present * 100.0 / total) * 10.0) / 10.0 : 0;
                    stats.put("attendancePercentage", pct);
                    stats.put("totalSubjects", subjectRepository.findByClassroom_ClassId(student.getClassroom().getClassId()).size());
                    stats.put("totalMarks", marksRepository.findByStudent_RegisterNumber(regNo).size());
                    stats.put("className", student.getClassroom().getClassName());
                    stats.put("semester", student.getSemester());
                });
                stats.put("unreadNotifications", notificationRepository.countByUserAndIsRead(user, false));
            }
            case PARENT -> {
                // parent stats handled via student link
                stats.put("unreadNotifications", notificationRepository.countByUserAndIsRead(user, false));
            }
        }
        return ResponseEntity.ok(stats);
    }
}
