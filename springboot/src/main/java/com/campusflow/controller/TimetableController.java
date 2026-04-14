package com.campusflow.controller;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableRepository timetableRepository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final ClassroomRepository classroomRepository;

    public TimetableController(TimetableRepository timetableRepository, SubjectRepository subjectRepository,
                                StaffRepository staffRepository, StudentRepository studentRepository,
                                ParentRepository parentRepository, ClassroomRepository classroomRepository) {
        this.timetableRepository = timetableRepository;
        this.subjectRepository = subjectRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.classroomRepository = classroomRepository;
    }

    // Get timetable for a class
    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(timetableRepository
            .findBySubject_Classroom_ClassIdOrderByDayOfWeekAscStartTimeAsc(classId)
            .stream().map(this::toMap).toList());
    }

    // Get timetable for logged-in user (student, staff, tutor, parent)
    @GetMapping("/my")
    public ResponseEntity<?> getMy(@AuthenticationPrincipal User user) {
        String classId = resolveClassId(user);
        if (classId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(timetableRepository
            .findBySubject_Classroom_ClassIdOrderByDayOfWeekAscStartTimeAsc(classId)
            .stream().map(this::toMap).toList());
    }

    // Save full timetable for a class (tutor only)
    @PostMapping("/class/{classId}")
    @PreAuthorize("hasRole('TUTOR')")
    @Transactional
    public ResponseEntity<?> saveTimetable(@PathVariable String classId,
                                            @RequestBody List<Map<String, Object>> entries,
                                            @AuthenticationPrincipal User user) {
        // Verify tutor owns this class
        staffRepository.findByUser(user).flatMap(classroomRepository::findByTutor).ifPresent(c -> {
            if (!c.getClassId().equals(classId)) throw new RuntimeException("Not your class");
        });
        timetableRepository.deleteBySubject_Classroom_ClassId(classId);
        entries.forEach(e -> {
            Long subjectId = Long.parseLong(e.get("subjectId").toString());
            subjectRepository.findById(subjectId).ifPresent(subject -> {
                Timetable t = new Timetable();
                t.setSubject(subject);
                t.setDayOfWeek(Timetable.DayOfWeek.valueOf(e.get("dayOfWeek").toString()));
                t.setStartTime(e.get("startTime").toString());
                t.setEndTime(e.get("endTime").toString());
                t.setRoomNumber(e.containsKey("roomNumber") ? e.get("roomNumber").toString() : null);
                timetableRepository.save(t);
            });
        });
        return ResponseEntity.ok(Map.of("message", "Timetable saved"));
    }

    private String resolveClassId(User user) {
        switch (user.getRole()) {
            case STUDENT:
                return studentRepository.findByUser(user)
                    .map(s -> s.getClassroom().getClassId()).orElse(null);
            case TUTOR:
                return staffRepository.findByUser(user)
                    .flatMap(classroomRepository::findByTutor)
                    .map(c -> c.getClassId()).orElse(null);
            case STAFF:
                return staffRepository.findByUser(user)
                    .map(staff -> subjectRepository.findByStaff_StaffId(staff.getStaffId())
                        .stream().findFirst()
                        .map(s -> s.getClassroom().getClassId()).orElse(null))
                    .orElse(null);
            case PARENT:
                return parentRepository.findByUser(user)
                    .map(p -> p.getStudent().getClassroom().getClassId()).orElse(null);
            default:
                return null;
        }
    }

    private Map<String, Object> toMap(Timetable t) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", t.getId());
        m.put("dayOfWeek", t.getDayOfWeek());
        m.put("startTime", t.getStartTime() != null ? t.getStartTime().substring(0, 5) : null);
        m.put("endTime", t.getEndTime() != null ? t.getEndTime().substring(0, 5) : null);
        m.put("roomNumber", t.getRoomNumber());
        m.put("subjectId", t.getSubject().getId());
        m.put("courseName", t.getSubject().getCourse().getCourseName());
        m.put("courseCode", t.getSubject().getCourse().getCourseCode());
        m.put("staffName", t.getSubject().getStaff().getName());
        m.put("className", t.getSubject().getClassroom().getClassName());
        return m;
    }
}
