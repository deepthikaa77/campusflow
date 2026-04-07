package com.campusflow.controller;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    private final ClassroomRepository classroomRepository;
    private final SubjectRepository subjectRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;

    public ClassroomController(ClassroomRepository classroomRepository, SubjectRepository subjectRepository, StaffRepository staffRepository, StudentRepository studentRepository) {
        this.classroomRepository = classroomRepository;
        this.subjectRepository = subjectRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(classroomRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return classroomRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/subjects")
    public ResponseEntity<?> getSubjects(@PathVariable String id) {
        return ResponseEntity.ok(subjectRepository.findByClassroom_ClassId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String tutorId = (String) body.get("tutorId");
        Staff tutor = staffRepository.findById(tutorId)
            .orElseThrow(() -> new RuntimeException("Tutor not found"));
        Classroom classroom = new Classroom();
        classroom.setClassId((String) body.get("classId"));
        classroom.setClassName((String) body.get("className"));
        classroom.setTutor(tutor);
        classroom.setSemester(Integer.parseInt(body.get("semester").toString()));
        classroom.setBatch((String) body.get("batch"));
        classroom.setDepartment((String) body.get("department"));
        classroom.setAcademicYear((String) body.get("academicYear"));
        classroomRepository.save(classroom);
        return ResponseEntity.status(201).body(Map.of("message", "Classroom created", "class_id", classroom.getClassId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return classroomRepository.findById(id).map(c -> {
            if (body.containsKey("className")) c.setClassName((String) body.get("className"));
            if (body.containsKey("semester")) c.setSemester(Integer.parseInt(body.get("semester").toString()));
            if (body.containsKey("batch")) c.setBatch((String) body.get("batch"));
            if (body.containsKey("department")) c.setDepartment((String) body.get("department"));
            if (body.containsKey("academicYear")) c.setAcademicYear((String) body.get("academicYear"));
            if (body.containsKey("tutorId")) staffRepository.findById((String) body.get("tutorId")).ifPresent(c::setTutor);
            classroomRepository.save(c);
            return ResponseEntity.ok(Map.of("message", "Classroom updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return classroomRepository.findById(id).map(c -> {
            if (!studentRepository.findByClassroom_ClassId(id).isEmpty())
                return ResponseEntity.badRequest().body(Map.of("message", "This classroom has students assigned to it. Please reassign or remove the students before deleting."));
            classroomRepository.delete(c);
            return ResponseEntity.ok(Map.of("message", "Classroom deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
