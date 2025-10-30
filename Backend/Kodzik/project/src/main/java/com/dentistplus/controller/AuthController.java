package com.dentistplus.controller;

import com.dentistplus.dto.DentistRegistrationRequest;
import com.dentistplus.dto.LoginRequest;
import com.dentistplus.dto.PatientRegistrationRequest;
import com.dentistplus.model.User;
import com.dentistplus.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with username and password")
    public ResponseEntity<User> login(@Valid @RequestBody LoginRequest loginRequest) {
        User user = authService.login(loginRequest);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register/patient")
    @Operation(summary = "Patient registration", description = "Public endpoint for patient self-registration")
    public ResponseEntity<User> registerPatient(@Valid @RequestBody PatientRegistrationRequest request) {
        User user = authService.registerPatient(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register/dentist")
    @Operation(summary = "Dentist registration", description = "Admin-only endpoint to create dentist accounts")
    public ResponseEntity<User> registerDentist(
            @Valid @RequestBody DentistRegistrationRequest request,
            @Parameter(description = "Admin user ID", required = true)
            @RequestHeader("X-User-ID") String adminUserId) {
        User user = authService.registerDentist(request, adminUserId);
        return ResponseEntity.ok(user);
    }
}