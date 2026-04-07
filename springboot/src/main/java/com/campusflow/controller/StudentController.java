package com.campusflow.controller;

import com.campusflow.model.*;
import com.campusflow.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentRepository studentRepository, ClassroomRepository classroomRepository,
                             UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(studentRepository.findByClassroom_ClassId(classId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return studentRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> create(@RequestBody Student student) {
        studentRepository.save(student);
        return ResponseEntity.status(201).body(Map.of("message", "Student created", "register_number", student.getRegisterNumber()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, String> body) {
        String registerNumber = body.get("registerNumber");
        String name = body.get("name");
        String email = body.get("email");
        String password = body.getOrDefault("password", "campus123");
        String classId = body.get("classId");
        String semesterStr = body.get("semester");
        String phoneNumber = body.get("phoneNumber");

        if (registerNumber == null || name == null || email == null || classId == null || semesterStr == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        if (studentRepository.existsById(registerNumber))
            return ResponseEntity.badRequest().body(Map.of("message", "Register number already exists"));

        Classroom classroom = classroomRepository.findById(classId).orElse(null);
        if (classroom == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Classroom not found"));

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setPhoneNumber((phoneNumber != null && !phoneNumber.isBlank()) ? phoneNumber : null);
        user.setRole(User.Role.STUDENT);
        user.setIsApproved(true);
        userRepository.save(user);

        Student student = new Student();
        student.setRegisterNumber(registerNumber);
        student.setName(name);
        student.setSemester(Integer.parseInt(semesterStr));
        student.setClassroom(classroom);
        student.setUser(user);
        studentRepository.save(student);

        return ResponseEntity.status(201).body(Map.of("message", "Student registered successfully", "register_number", registerNumber));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Student updated) {
        return studentRepository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setSemester(updated.getSemester());
            s.setClassroom(updated.getClassroom());
            studentRepository.save(s);
            return ResponseEntity.ok(Map.of("message", "Student updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return studentRepository.findById(id).map(s -> {
            studentRepository.delete(s);
            return ResponseEntity.ok(Map.of("message", "Student deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadExcel(@RequestParam("file") MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int created = 0;
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                try {
                    String registerNumber = getCellValue(row, 0);
                    String name = getCellValue(row, 1);
                    String semesterStr = getCellValue(row, 2);
                    String classId = getCellValue(row, 3);
                    String email = getCellValue(row, 4);
                    if (email.isEmpty()) email = registerNumber.toLowerCase() + "@campus.com";

                    if (registerNumber.isEmpty() || name.isEmpty() || classId.isEmpty()) {
                        errors.add("Row " + (i+1) + ": missing required fields");
                        continue;
                    }
                    Classroom classroom = classroomRepository.findById(classId).orElse(null);
                    if (classroom == null) {
                        errors.add("Row " + (i+1) + ": class_id '" + classId + "' not found");
                        continue;
                    }
                    if (studentRepository.existsById(registerNumber)) {
                        errors.add("Row " + (i+1) + ": register_number '" + registerNumber + "' already exists");
                        continue;
                    }
                    if (userRepository.existsByEmail(email)) {
                        errors.add("Row " + (i+1) + ": email '" + email + "' already exists");
                        continue;
                    }
                    User user = new User();
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode("campus123"));
                    user.setName(name);
                    user.setRole(User.Role.STUDENT);
                    user.setIsApproved(true);
                    userRepository.save(user);

                    Student student = new Student();
                    student.setRegisterNumber(registerNumber);
                    student.setName(name);
                    student.setSemester(semesterStr.isEmpty() ? 1 : (int) Double.parseDouble(semesterStr));
                    student.setClassroom(classroom);
                    student.setUser(user);
                    studentRepository.save(student);
                    created++;
                } catch (Exception e) {
                    errors.add("Row " + (i+1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file: " + e.getMessage()));
        }
        Map<String, Object> result = new HashMap<>();
        result.put("created", created);
        result.put("errors", errors);
        result.put("message", created + " students imported successfully");
        return ResponseEntity.ok(result);
    }

    private String getCellValue(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
}
