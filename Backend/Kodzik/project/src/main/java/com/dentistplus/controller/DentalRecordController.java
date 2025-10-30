package com.dentistplus.controller;

import com.dentistplus.model.DentalRecord;
import com.dentistplus.service.DentalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Dental Records", description = "Dental health record management endpoints")
public class DentalRecordController {

    @Autowired
    private DentalRecordService dentalRecordService;

    @GetMapping("/patients/{patientId}/record")
    @Operation(summary = "Get dental record", description = "Get the full dental record (ROLE_DENTIST required)")
    public ResponseEntity<DentalRecord> getDentalRecord(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        DentalRecord record = dentalRecordService.getDentalRecord(patientId, dentistUserId);
        return ResponseEntity.ok(record);
    }

    @PutMapping("/patients/{patientId}/record/chart")
    @Operation(summary = "Update dental chart", description = "Update the dentalChart object (ROLE_DENTIST required)")
    public ResponseEntity<DentalRecord> updateDentalChart(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @RequestBody Map<String, Map<String, String>> dentalChart,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        DentalRecord record = dentalRecordService.updateDentalChart(patientId, dentalChart, dentistUserId);
        return ResponseEntity.ok(record);
    }

    @PostMapping("/patients/{patientId}/record/attachments")
    @Operation(summary = "Add attachment", description = "Add attachment metadata (ROLE_DENTIST required)")
    public ResponseEntity<DentalRecord> addAttachment(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @RequestBody DentalRecord.Attachment attachment,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        DentalRecord record = dentalRecordService.addAttachment(patientId, attachment, dentistUserId);
        return ResponseEntity.ok(record);
    }

    @PostMapping("/patients/{patientId}/record/notes")
    @Operation(summary = "Add clinical note", description = "Add a new clinical note (ROLE_DENTIST required)")
    public ResponseEntity<DentalRecord> addClinicalNote(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @RequestBody Map<String, String> noteRequest,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        String note = noteRequest.get("note");
        DentalRecord record = dentalRecordService.addClinicalNote(patientId, note, dentistUserId);
        return ResponseEntity.ok(record);
    }
}