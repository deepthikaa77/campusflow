package com.campusflow.controller;

import com.campusflow.model.Staff;
import com.campusflow.model.User;
import com.campusflow.repository.ClassroomRepository;
import com.campusflow.repository.StaffRepository;
import com.campusflow.repository.SubjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffRepository staffRepository;
    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;

    public StaffController(StaffRepository staffRepository, ClassroomRepository classroomRepository, SubjectRepository subjectRepository) {
        this.staffRepository = staffRepository;
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
    }

    private Map<String, Object> toMap(Staff s) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("staffId", s.getStaffId());
        map.put("name", s.getName());
        map.put("department", s.getDepartment());
        map.put("batch", s.getBatch());
        map.put("currentRole", s.getCurrentRole() != null ? s.getCurrentRole().name() : null);
        map.put("userId", s.getUser() != null ? s.getUser().getId() : null);
        return map;
    }

    @GetMapping("/my-class")
    @PreAuthorize("hasAnyRole('TUTOR','STAFF')")
    public ResponseEntity<?> getMyClass(@AuthenticationPrincipal User user) {
        return staffRepository.findByUser(user).map(staff -> {
            // For TUTOR: find class they tutor
            if (staff.getCurrentRole() == Staff.CurrentRole.TUTOR) {
                return classroomRepository.findByTutor(staff)
                    .map(c -> ResponseEntity.ok(Map.of("classId", c.getClassId(), "className", c.getClassName())))
                    .orElse(ResponseEntity.ok(Map.of()));
            }
            // For STAFF: find distinct classes from their assigned subjects
            List<Map<String, Object>> classes = subjectRepository.findByStaff_StaffId(staff.getStaffId())
                .stream()
                .map(s -> Map.of("classId", (Object) s.getClassroom().getClassId(), "className", (Object) s.getClassroom().getClassName()))
                .distinct()
                .collect(Collectors.toList());
            return ResponseEntity.ok(classes.isEmpty() ? Map.of() : classes.get(0));
        }).orElse(ResponseEntity.ok(Map.of()));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<Map<String, Object>> result = staffRepository.findAll().stream().map(this::toMap).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return staffRepository.findById(id).map(s -> ResponseEntity.ok(toMap(s))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> create(@RequestBody Staff staff) {
        staffRepository.save(staff);
        return ResponseEntity.status(201).body(Map.of("message", "Staff created", "staff_id", staff.getStaffId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Staff updated) {
        return staffRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setDepartment(updated.getDepartment());
            s.setBatch(updated.getBatch());
            s.setCurrentRole(updated.getCurrentRole());
            staffRepository.save(s);
            return ResponseEntity.ok(Map.of("message", "Staff updated"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
