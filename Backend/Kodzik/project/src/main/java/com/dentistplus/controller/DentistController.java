package com.dentistplus.controller;

import com.dentistplus.model.Appointment;
import com.dentistplus.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dentist")
@Tag(name = "Dentist Portal", description = "Dentist-facing endpoints for managing their appointments and patients")
public class DentistController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/appointments")
    @Operation(summary = "Get dentist appointments", description = "Get all appointments for the logged-in dentist (ROLE_DENTIST required)")
    public ResponseEntity<List<Appointment>> getDentistAppointments(
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        List<Appointment> appointments = appointmentService.getDentistAppointments(dentistUserId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/today")
    @Operation(summary = "Get today's appointments", description = "Get today's appointments for the logged-in dentist (ROLE_DENTIST required)")
    public ResponseEntity<List<Appointment>> getTodayAppointments(
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        List<Appointment> appointments = appointmentService.getDentistTodayAppointments(dentistUserId);
        return ResponseEntity.ok(appointments);
    }
}
