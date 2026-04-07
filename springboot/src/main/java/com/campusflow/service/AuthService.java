package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.model.*;
import com.campusflow.repository.*;
import com.campusflow.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final ClassroomRepository classroomRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, StaffRepository staffRepository,
                       StudentRepository studentRepository, ParentRepository parentRepository,
                       ClassroomRepository classroomRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.classroomRepository = classroomRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");
        if (!user.getIsApproved())
            throw new RuntimeException("Account not approved yet. Please contact admin.");

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", buildUserProfile(user));
        return response;
    }

    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setPhoneNumber(req.getPhoneNumber());
        User.Role role = User.Role.valueOf(req.getRole());
        user.setRole(role);
        user.setIsApproved(true);
        userRepository.save(user);

        if (role == User.Role.STAFF || role == User.Role.TUTOR) {
            Staff staff = new Staff();
            staff.setStaffId(req.getStaffId());
            staff.setName(req.getName());
            staff.setDepartment(req.getDepartment() != null ? req.getDepartment() : "General");
            staff.setBatch(req.getBatch() != null ? req.getBatch() : "N/A");
            staff.setCurrentRole(Staff.CurrentRole.valueOf(role.name()));
            staff.setUser(user);
            staffRepository.save(staff);
        }
        return Map.of("message", "User registered successfully", "userId", user.getId());
    }

    public Map<String, Object> getMe(User user) {
        return buildUserProfile(user);
    }

    private Map<String, Object> buildUserProfile(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("email", user.getEmail());
        data.put("name", user.getName());
        data.put("role", user.getRole().name());
        switch (user.getRole()) {
            case ADMIN -> {}
            case STUDENT -> studentRepository.findByUser(user).ifPresent(s -> {
                data.put("register_number", s.getRegisterNumber());
                data.put("semester", s.getSemester());
                data.put("class_id", s.getClassroom().getClassId());
                data.put("class_name", s.getClassroom().getClassName());
                data.put("batch", s.getClassroom().getBatch());
                data.put("department", s.getClassroom().getDepartment());
            });
            case STAFF, TUTOR -> staffRepository.findByUser(user).ifPresent(s -> {
                data.put("staff_id", s.getStaffId());
                data.put("department", s.getDepartment());
                data.put("batch", s.getBatch());
                data.put("current_role", s.getCurrentRole().name());
                classroomRepository.findByTutor(s).ifPresent(c -> {
                    data.put("class_id", c.getClassId());
                    data.put("class_name", c.getClassName());
                });
            });
            case PARENT -> parentRepository.findByUser(user).ifPresent(p -> {
                data.put("student_id", p.getStudent().getRegisterNumber());
                data.put("student_name", p.getStudent().getName());
                data.put("class_id", p.getStudent().getClassroom().getClassId());
                data.put("semester", p.getStudent().getSemester());
                data.put("relationship", p.getRelationship().name());
            });
        }
        return data;
    }
}
