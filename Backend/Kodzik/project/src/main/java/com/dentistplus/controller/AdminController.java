package com.dentistplus.controller;

import com.dentistplus.dto.CreateUserRequest;
import com.dentistplus.dto.UpdateUserRequest;
import com.dentistplus.model.User;
import com.dentistplus.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Admin endpoints for managing users")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get all dentists
     */
    @GetMapping("/dentists")
    @Operation(summary = "Get all dentists", description = "Admin-only endpoint to retrieve all dentists")
    public ResponseEntity<List<User>> getAllDentists(
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        List<User> dentists = adminService.getAllDentists(adminUserId);
        return ResponseEntity.ok(dentists);
    }

    /**
     * Get all patients
     */
    @GetMapping("/patients")
    @Operation(summary = "Get all patients", description = "Admin-only endpoint to retrieve all patients")
    public ResponseEntity<List<User>> getAllPatients(
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        List<User> patients = adminService.getAllPatients(adminUserId);
        return ResponseEntity.ok(patients);
    }

    /**
     * Create a new dentist
     */
    @PostMapping("/dentists")
    @Operation(summary = "Create a new dentist", description = "Admin-only endpoint to create a new dentist user")
    public ResponseEntity<User> createDentist(
            @Valid @RequestBody CreateUserRequest request,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        User dentist = adminService.createDentist(request, adminUserId);
        return ResponseEntity.ok(dentist);
    }

    /**
     * Create a new patient
     */
    @PostMapping("/patients")
    @Operation(summary = "Create a new patient", description = "Admin-only endpoint to create a new patient user")
    public ResponseEntity<User> createPatient(
            @Valid @RequestBody CreateUserRequest request,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        User patient = adminService.createPatient(request, adminUserId);
        return ResponseEntity.ok(patient);
    }

    /**
     * Update a dentist
     */
    @PutMapping("/dentists/{dentistId}")
    @Operation(summary = "Update a dentist", description = "Admin-only endpoint to update a dentist user")
    public ResponseEntity<User> updateDentist(
            @PathVariable String dentistId,
            @Valid @RequestBody UpdateUserRequest request,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        User dentist = adminService.updateDentist(dentistId, request, adminUserId);
        return ResponseEntity.ok(dentist);
    }

    /**
     * Update a patient
     */
    @PutMapping("/patients/{patientId}")
    @Operation(summary = "Update a patient", description = "Admin-only endpoint to update a patient user")
    public ResponseEntity<User> updatePatient(
            @PathVariable String patientId,
            @Valid @RequestBody UpdateUserRequest request,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        User patient = adminService.updatePatient(patientId, request, adminUserId);
        return ResponseEntity.ok(patient);
    }

    /**
     * Delete a dentist
     */
    @DeleteMapping("/dentists/{dentistId}")
    @Operation(summary = "Delete a dentist", description = "Admin-only endpoint to delete a dentist user")
    public ResponseEntity<Void> deleteDentist(
            @PathVariable String dentistId,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        adminService.deleteDentist(dentistId, adminUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a patient
     */
    @DeleteMapping("/patients/{patientId}")
    @Operation(summary = "Delete a patient", description = "Admin-only endpoint to delete a patient user")
    public ResponseEntity<Void> deletePatient(
            @PathVariable String patientId,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        adminService.deletePatient(patientId, adminUserId);
        return ResponseEntity.noContent().build();
    }
}
