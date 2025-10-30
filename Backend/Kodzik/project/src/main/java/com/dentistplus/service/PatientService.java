package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PatientService {
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuthService authService;

    public List<PatientProfile> getAllPatients(String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        return patientProfileRepository.findAll();
    }

    public List<PatientProfile> searchPatients(String query, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        return patientProfileRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query);
    }

    public PatientProfile getPatientById(String patientId, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        return patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
    }

    public PatientProfile updatePatient(String patientId, PatientProfile updatedProfile, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile existingProfile = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Update fields
        existingProfile.setFirstName(updatedProfile.getFirstName());
        existingProfile.setLastName(updatedProfile.getLastName());
        existingProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        existingProfile.setContactPhone(updatedProfile.getContactPhone());
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setMedicalHistorySummary(updatedProfile.getMedicalHistorySummary());
        existingProfile.setInsuranceDetails(updatedProfile.getInsuranceDetails());
        existingProfile.setUpdatedAt(LocalDateTime.now());

        return patientProfileRepository.save(existingProfile);
    }

    public PatientProfile getMyProfile(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        return patientProfileRepository.findByUserId(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }
}