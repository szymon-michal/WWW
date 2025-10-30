package com.dentistplus.controller;

import com.dentistplus.model.PatientProfile;
import com.dentistplus.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Patient Management", description = "Patient management endpoints for dentists")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping("/patients")
    @Operation(summary = "Get all patients", description = "Search/list all patients (ROLE_DENTIST required)")
    public ResponseEntity<List<PatientProfile>> getAllPatients(
            @Parameter(description = "Search query for patient name", required = false)
            @RequestParam(required = false) String search,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        List<PatientProfile> patients = search != null ? 
            patientService.searchPatients(search, dentistUserId) : 
            patientService.getAllPatients(dentistUserId);
        
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{patientId}")
    @Operation(summary = "Get patient by ID", description = "Get full profile of a single patient (ROLE_DENTIST required)")
    public ResponseEntity<PatientProfile> getPatientById(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        PatientProfile patient = patientService.getPatientById(patientId, dentistUserId);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/patients/{patientId}")
    @Operation(summary = "Update patient profile", description = "Update patient profile (ROLE_DENTIST required)")
    public ResponseEntity<PatientProfile> updatePatient(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @RequestBody PatientProfile patientProfile,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        PatientProfile updatedPatient = patientService.updatePatient(patientId, patientProfile, dentistUserId);
        return ResponseEntity.ok(updatedPatient);
    }
}