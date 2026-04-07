package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.model.User;
import com.campusflow.service.QueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/queries")
public class QueryController {

    private final QueryService queryService;

    public QueryController(QueryService queryService) { this.queryService = queryService; }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','PARENT','STAFF','TUTOR')")
    public ResponseEntity<?> create(@RequestBody QueryRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(queryService.create(req, user));
    }

    @GetMapping("/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(queryService.getSent(user));
    }

    @GetMapping("/received")
    @PreAuthorize("hasAnyRole('ADMIN','TUTOR')")
    public ResponseEntity<?> getReceived(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(queryService.getReceived(user));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('ADMIN','TUTOR')")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody RespondRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(queryService.respond(id, req, user));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> close(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(queryService.close(id, user));
    }
}
