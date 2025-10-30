package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.model.Appointment;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.repository.AppointmentRepository;
import com.dentistplus.repository.PatientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private AuthService authService;

    public List<Appointment> getMyAppointments(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUserId(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return appointmentRepository.findByPatientProfile(patient);
    }
}