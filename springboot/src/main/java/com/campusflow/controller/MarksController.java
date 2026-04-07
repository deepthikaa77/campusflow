package com.campusflow.controller;

import com.campusflow.dto.MarksRequest;
import com.campusflow.model.User;
import com.campusflow.service.MarksService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) { this.marksService = marksService; }

    @GetMapping("/exam-types")
    public ResponseEntity<?> getExamTypes() {
        return ResponseEntity.ok(marksService.getExamTypes());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> enter(@RequestBody MarksRequest req, @AuthenticationPrincipal User user) {
        marksService.saveMarks(req.getStudentId(), req.getSubjectId(), req.getExamTypeId(), req.getMarksObtained(), user);
        return ResponseEntity.status(201).body(Map.of("message", "Marks saved"));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('STAFF','TUTOR')")
    public ResponseEntity<?> enterBulk(@RequestBody MarksRequest req, @AuthenticationPrincipal User user) {
        marksService.saveBulkMarks(req, user);
        return ResponseEntity.ok(Map.of("message", "Bulk marks saved"));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR','STUDENT','PARENT')")
    public ResponseEntity<?> getStudentMarks(@PathVariable String studentId) {
        return ResponseEntity.ok(marksService.getStudentMarks(studentId));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TUTOR')")
    public ResponseEntity<?> getSubjectMarks(@PathVariable Long subjectId,
                                              @RequestParam(required = false) Integer exam_type_id) {
        return ResponseEntity.ok(marksService.getSubjectMarks(subjectId, exam_type_id));
    }
}
