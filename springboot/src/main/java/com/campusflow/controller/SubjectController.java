package com.campusflow.controller;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final StaffRepository staffRepository;

    public SubjectController(SubjectRepository subjectRepository, CourseRepository courseRepository,
                             ClassroomRepository classroomRepository, StaffRepository staffRepository) {
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
        this.classroomRepository = classroomRepository;
        this.staffRepository = staffRepository;
    }

    // --- Courses ---
    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Map<String, Object> body) {
        if (courseRepository.existsByCourseCode((String) body.get("courseCode")))
            throw new RuntimeException("Course code already exists");
        Course course = new Course();
        course.setCourseId((String) body.get("courseId"));
        course.setCourseName((String) body.get("courseName"));
        course.setCourseCode((String) body.get("courseCode"));
        course.setBatch((String) body.get("batch"));
        course.setSemester(Integer.parseInt(body.get("semester").toString()));
        course.setCredits(body.containsKey("credits") ? Integer.parseInt(body.get("credits").toString()) : 3);
        courseRepository.save(course);
        return ResponseEntity.status(201).body(Map.of("message", "Course created", "courseId", course.getCourseId()));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        return courseRepository.findById(id).map(c -> {
            courseRepository.delete(c);
            return ResponseEntity.ok(Map.of("message", "Course deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Subjects (assign course to class) ---
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> getMySubjects(@AuthenticationPrincipal User user) {
        return staffRepository.findByUser(user)
            .map(staff -> {
                List<java.util.Map<String, Object>> result = subjectRepository.findByStaff_StaffId(staff.getStaffId())
                    .stream().map(s -> {
                        java.util.Map<String, Object> m = new java.util.HashMap<>();
                        m.put("id", s.getId());
                        m.put("course", java.util.Map.of(
                            "courseId", s.getCourse().getCourseId(),
                            "courseName", s.getCourse().getCourseName()
                        ));
                        m.put("classroom", java.util.Map.of(
                            "classId", s.getClassroom().getClassId(),
                            "className", s.getClassroom().getClassName()
                        ));
                        return m;
                    }).toList();
                return ResponseEntity.ok(result);
            })
            .orElse(ResponseEntity.ok(java.util.List.of()));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(subjectRepository.findByClassroom_ClassId(classId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignSubject(@RequestBody Map<String, Object> body) {
        String classId = (String) body.get("classId");
        String courseId = (String) body.get("courseId");
        String staffId = (String) body.get("staffId");

        Classroom classroom = classroomRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        Subject subject = new Subject();
        subject.setClassroom(classroom);
        subject.setCourse(course);
        subject.setStaff(staff);
        subjectRepository.save(subject);
        return ResponseEntity.status(201).body(Map.of("message", "Subject assigned", "id", subject.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        return subjectRepository.findById(id).map(s -> {
            subjectRepository.delete(s);
            return ResponseEntity.ok(Map.of("message", "Subject removed"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
