package com.campusflow.controller;

import com.campusflow.model.User;
import com.campusflow.repository.ClassroomRepository;
import com.campusflow.repository.StaffRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;

    public AdminController(UserRepository userRepository, StaffRepository staffRepository, StudentRepository studentRepository, ClassroomRepository classroomRepository) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(u -> {
            if (body.containsKey("name")) u.setName(body.get("name"));
            if (body.containsKey("phoneNumber")) u.setPhoneNumber(body.get("phoneNumber"));
            if (body.containsKey("role")) u.setRole(User.Role.valueOf(body.get("role")));
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "User updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setIsApproved(true);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "User approved"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/revoke")
    public ResponseEntity<?> revokeUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setIsApproved(false);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "User approval revoked"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            staffRepository.findByUser(u).ifPresent(staff -> {
                classroomRepository.findByTutor(staff).ifPresent(c -> {
                    c.setTutor(null);
                    classroomRepository.save(c);
                });
                staffRepository.delete(staff);
            });
            studentRepository.findByUser(u).ifPresent(studentRepository::delete);
            userRepository.delete(u);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
