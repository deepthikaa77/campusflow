package com.campusflow.controller;

import com.campusflow.dto.AttendanceRequest;
import com.campusflow.model.User;
import com.campusflow.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) { this.attendanceService = attendanceService; }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> mark(@RequestBody AttendanceRequest req, @AuthenticationPrincipal User user) {
        attendanceService.markAttendance(req, user);
        return ResponseEntity.ok(Map.of("message", "Attendance marked successfully"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAttendance(@PathVariable String studentId,
                                                   @RequestParam(required = false) Long subject_id) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, subject_id));
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<?> getSummary(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummary(studentId));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getSubjectAttendance(@PathVariable Long subjectId,
                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getSubjectAttendance(subjectId, date));
    }
}
