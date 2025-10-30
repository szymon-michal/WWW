package com.dentistplus.controller;

import com.dentistplus.model.TreatmentPlan;
import com.dentistplus.service.TreatmentPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Treatment & Planning", description = "Treatment plan and procedure management endpoints")
public class TreatmentController {

    @Autowired
    private TreatmentPlanService treatmentPlanService;

    @GetMapping("/patients/{patientId}/plans")
    @Operation(summary = "Get treatment plans", description = "Get all treatment plans for a patient (ROLE_DENTIST required)")
    public ResponseEntity<List<TreatmentPlan>> getTreatmentPlans(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        List<TreatmentPlan> plans = treatmentPlanService.getTreatmentPlans(patientId, dentistUserId);
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/patients/{patientId}/plans")
    @Operation(summary = "Create treatment plan", description = "Create a new treatment plan (ROLE_DENTIST required)")
    public ResponseEntity<TreatmentPlan> createTreatmentPlan(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @RequestBody TreatmentPlan treatmentPlan,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        TreatmentPlan plan = treatmentPlanService.createTreatmentPlan(patientId, treatmentPlan, dentistUserId);
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/plans/{planId}/procedures")
    @Operation(summary = "Add procedure to plan", description = "Add a procedure to a treatment plan (ROLE_DENTIST required)")
    public ResponseEntity<TreatmentPlan> addProcedureToTreatmentPlan(
            @Parameter(description = "Treatment plan ID", required = true)
            @PathVariable String planId,
            @RequestBody TreatmentPlan.PlannedProcedure procedure,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        TreatmentPlan plan = treatmentPlanService.addProcedureToTreatmentPlan(planId, procedure, dentistUserId);
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/procedures/{procedureId}")
    @Operation(summary = "Update procedure", description = "Update procedure status or cost (ROLE_DENTIST required)")
    public ResponseEntity<TreatmentPlan> updateProcedure(
            @Parameter(description = "Procedure ID", required = true)
            @PathVariable String procedureId,
            @RequestBody TreatmentPlan.PlannedProcedure procedure,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        TreatmentPlan plan = treatmentPlanService.updateProcedure(procedureId, procedure, dentistUserId);
        return ResponseEntity.ok(plan);
    }
}