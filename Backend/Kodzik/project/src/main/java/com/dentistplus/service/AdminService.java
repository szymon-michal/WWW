package com.dentistplus.service;

import com.dentistplus.dto.CreateUserRequest;
import com.dentistplus.dto.UpdateUserRequest;
import com.dentistplus.exception.UnauthorizedException;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;

    /**
     * Verify that the requesting user has ADMIN role
     */
    private void verifyAdminRole(String adminUserId) {
        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new UnauthorizedException("Invalid user"));
        
        if (!admin.getRoles().contains("ROLE_ADMIN")) {
            throw new UnauthorizedException("Only administrators can perform this action");
        }
    }

    /**
     * Get all dentists
     */
    public List<User> getAllDentists(String adminUserId) {
        verifyAdminRole(adminUserId);
        return userRepository.findByRolesContaining("ROLE_DENTIST");
    }

    /**
     * Get all patients (users with ROLE_PATIENT)
     */
    public List<User> getAllPatients(String adminUserId) {
        verifyAdminRole(adminUserId);
        return userRepository.findByRolesContaining("ROLE_PATIENT");
    }

    /**
     * Create a new dentist user
     */
    public User createDentist(CreateUserRequest request, String adminUserId) {
        verifyAdminRole(adminUserId);

        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user with ROLE_DENTIST
        User user = new User(
            request.getUsername(),
            request.getPassword(),
            request.getEmail(),
            request.getFirstName(),
            request.getLastName(),
            Arrays.asList("ROLE_DENTIST")
        );
        
        System.out.println("AdminService: Creating new dentist with username: " + request.getUsername());
        return userRepository.save(user);
    }

    /**
     * Create a new patient user
     */
    public User createPatient(CreateUserRequest request, String adminUserId) {
        verifyAdminRole(adminUserId);

        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user with ROLE_PATIENT
        User user = new User(
            request.getUsername(),
            request.getPassword(),
            request.getEmail(),
            request.getFirstName(),
            request.getLastName(),
            Arrays.asList("ROLE_PATIENT")
        );
        
        System.out.println("AdminService: Creating new patient with username: " + request.getUsername());
        User savedUser = userRepository.save(user);

        // Create patient profile
        PatientProfile patientProfile = new PatientProfile(
            savedUser,
            request.getFirstName(),
            request.getLastName(),
            LocalDate.of(1990, 1, 1) // Default date of birth, can be updated later
        );
        patientProfileRepository.save(patientProfile);

        return savedUser;
    }

    /**
     * Update a dentist user
     */
    public User updateDentist(String dentistId, UpdateUserRequest request, String adminUserId) {
        verifyAdminRole(adminUserId);

        User dentist = userRepository.findById(dentistId)
            .orElseThrow(() -> new IllegalArgumentException("Dentist not found"));

        if (!dentist.getRoles().contains("ROLE_DENTIST")) {
            throw new IllegalArgumentException("User is not a dentist");
        }

        // Check if new email already exists (and is different from current)
        if (request.getEmail() != null && !request.getEmail().equals(dentist.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            dentist.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            dentist.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            dentist.setLastName(request.getLastName());
        }
        if (request.getPassword() != null) {
            dentist.setPassword(request.getPassword());
        }

        dentist.setUpdatedAt(LocalDateTime.now());
        
        System.out.println("AdminService: Updating dentist with ID: " + dentistId);
        return userRepository.save(dentist);
    }

    /**
     * Update a patient user
     */
    public User updatePatient(String patientId, UpdateUserRequest request, String adminUserId) {
        verifyAdminRole(adminUserId);

        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (!patient.getRoles().contains("ROLE_PATIENT")) {
            throw new IllegalArgumentException("User is not a patient");
        }

        // Check if new email already exists (and is different from current)
        if (request.getEmail() != null && !request.getEmail().equals(patient.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            patient.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            patient.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            patient.setLastName(request.getLastName());
        }
        if (request.getPassword() != null) {
            patient.setPassword(request.getPassword());
        }

        patient.setUpdatedAt(LocalDateTime.now());
        
        System.out.println("AdminService: Updating patient with ID: " + patientId);
        return userRepository.save(patient);
    }

    /**
     * Delete a dentist user
     */
    public void deleteDentist(String dentistId, String adminUserId) {
        verifyAdminRole(adminUserId);

        User dentist = userRepository.findById(dentistId)
            .orElseThrow(() -> new IllegalArgumentException("Dentist not found"));

        if (!dentist.getRoles().contains("ROLE_DENTIST")) {
            throw new IllegalArgumentException("User is not a dentist");
        }

        System.out.println("AdminService: Deleting dentist with ID: " + dentistId);
        userRepository.deleteById(dentistId);
    }

    /**
     * Delete a patient user
     */
    public void deletePatient(String patientId, String adminUserId) {
        verifyAdminRole(adminUserId);

        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (!patient.getRoles().contains("ROLE_PATIENT")) {
            throw new IllegalArgumentException("User is not a patient");
        }

        System.out.println("AdminService: Deleting patient with ID: " + patientId);
        
        // Delete patient profile first
        patientProfileRepository.findByUser(patient).ifPresent(patientProfileRepository::delete);

        // Then delete user
        userRepository.deleteById(patientId);
    }
}
