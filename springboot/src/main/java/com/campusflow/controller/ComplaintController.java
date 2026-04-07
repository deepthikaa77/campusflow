package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.model.User;
import com.campusflow.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) { this.complaintService = complaintService; }

    @PostMapping
    @PreAuthorize("hasAnyRole('PARENT','STAFF','STUDENT')")
    public ResponseEntity<?> create(@RequestBody ComplaintRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(complaintService.create(req, user));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMy(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getMyComplaints(user));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<?> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(complaintService.getClassComplaints(classId));
    }

    @GetMapping("/my-class")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<?> getMyClass(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getMyClassComplaints(user));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody RespondRequest req) {
        return ResponseEntity.ok(complaintService.respond(id, req));
    }
}
