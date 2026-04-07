package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.model.User;
import com.campusflow.service.GrievanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) { this.grievanceService = grievanceService; }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','STAFF')")
    public ResponseEntity<?> create(@RequestBody GrievanceRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(grievanceService.create(req, user));
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(grievanceService.getSent(user));
    }

    @GetMapping("/received")
    @PreAuthorize("hasAnyRole('TUTOR','STAFF')")
    public ResponseEntity<?> getReceived(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(grievanceService.getReceived(user));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('TUTOR','STAFF')")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody RespondRequest req) {
        return ResponseEntity.ok(grievanceService.respond(id, req));
    }
}
