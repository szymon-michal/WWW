package com.dentistplus.controller;

import com.dentistplus.model.*;
import com.dentistplus.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my")
@Tag(name = "Patient Portal", description = "Patient-facing endpoints for accessing their own data")
public class PatientPortalController {

    @Autowired
    private PatientService patientService;
    
    @Autowired
    private DentalRecordService dentalRecordService;
    
    @Autowired
    private TreatmentPlanService treatmentPlanService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Get patient's own profile (ROLE_PATIENT required)")
    public ResponseEntity<PatientProfile> getMyProfile(
            @Parameter(description = "Patient user ID", required = true)
            @RequestHeader("X-User-ID") String patientUserId) {
        
        PatientProfile profile = patientService.getMyProfile(patientUserId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/record")
    @Operation(summary = "Get my dental record", description = "Get patient's own dental record (ROLE_PATIENT required)")
    public ResponseEntity<DentalRecord> getMyDentalRecord(
            @Parameter(description = "Patient user ID", required = true)
            @RequestHeader("X-User-ID") String patientUserId) {
        
        DentalRecord record = dentalRecordService.getMyDentalRecord(patientUserId);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/plans")
    @Operation(summary = "Get my treatment plans", description = "Get patient's own treatment plans (ROLE_PATIENT required)")
    public ResponseEntity<List<TreatmentPlan>> getMyTreatmentPlans(
            @Parameter(description = "Patient user ID", required = true)
            @RequestHeader("X-User-ID") String patientUserId) {
        
        List<TreatmentPlan> plans = treatmentPlanService.getMyTreatmentPlans(patientUserId);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/appointments")
    @Operation(summary = "Get my appointments", description = "Get patient's own appointments (ROLE_PATIENT required)")
    public ResponseEntity<List<Appointment>> getMyAppointments(
            @Parameter(description = "Patient user ID", required = true)
            @RequestHeader("X-User-ID") String patientUserId) {
        
        List<Appointment> appointments = appointmentService.getMyAppointments(patientUserId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/invoices")
    @Operation(summary = "Get my invoices", description = "Get patient's billing history (ROLE_PATIENT required)")
    public ResponseEntity<List<Invoice>> getMyInvoices(
            @Parameter(description = "Patient user ID", required = true)
            @RequestHeader("X-User-ID") String patientUserId) {
        
        List<Invoice> invoices = invoiceService.getMyInvoices(patientUserId);
        return ResponseEntity.ok(invoices);
    }
}