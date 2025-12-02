package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.exception.UnauthorizedException;
import com.dentistplus.model.Appointment;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import com.dentistplus.repository.AppointmentRepository;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuthService authService;

    public List<Appointment> getMyAppointments(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return appointmentRepository.findByPatientProfile(patient);
    }

    public Appointment rescheduleAppointment(String appointmentId, String newDateStr, String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        // Get the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Verify the appointment belongs to this patient
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        
        if (!appointment.getPatientProfile().getId().equals(patient.getId())) {
            throw new UnauthorizedException("You can only reschedule your own appointments");
        }
        
        // Check if appointment can be rescheduled (not completed or cancelled)
        if ("COMPLETED".equals(appointment.getStatus()) || "CANCELLED".equals(appointment.getStatus())) {
            throw new IllegalArgumentException("Cannot reschedule completed or cancelled appointments");
        }
        
        // Parse the new date
        LocalDateTime newDate = LocalDateTime.parse(newDateStr, DateTimeFormatter.ISO_DATE_TIME);
        
        // Update the appointment
        appointment.setAppointmentDate(newDate);
        appointment.setStatus("SCHEDULED");
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(String appointmentId, String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        // Get the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Verify the appointment belongs to this patient
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        
        if (!appointment.getPatientProfile().getId().equals(patient.getId())) {
            throw new UnauthorizedException("You can only cancel your own appointments");
        }
        
        // Check if appointment can be cancelled (not already completed or cancelled)
        if ("COMPLETED".equals(appointment.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel completed appointments");
        }
        
        if ("CANCELLED".equals(appointment.getStatus())) {
            throw new IllegalArgumentException("Appointment is already cancelled");
        }
        
        // Update the appointment status to CANCELLED
        appointment.setStatus("CANCELLED");
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }

    public Appointment bookAppointment(String patientUserId, String dentistId, String appointmentDateStr, String appointmentType) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        // Get patient profile
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        
        // Get dentist
        User dentist = userRepository.findById(dentistId)
            .orElseThrow(() -> new ResourceNotFoundException("Dentist not found with id: " + dentistId));
        
        // Validate dentist role
        if (!dentist.getRoles().contains("ROLE_DENTIST")) {
            throw new IllegalArgumentException("Selected user is not a dentist");
        }
        
        // Parse appointment date
        LocalDateTime appointmentDate = LocalDateTime.parse(appointmentDateStr, DateTimeFormatter.ISO_DATE_TIME);
        
        // Create new appointment
        Appointment appointment = new Appointment(patient, dentist, appointmentDate, appointmentType);
        appointment.setStatus("SCHEDULED");
        appointment.setDurationMinutes(30); // Default 30 minutes
        
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getDentistAppointments(String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        User dentist = userRepository.findById(dentistUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Dentist not found"));
        
        return appointmentRepository.findByDentist(dentist);
    }

    public List<Appointment> getDentistTodayAppointments(String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        User dentist = userRepository.findById(dentistUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Dentist not found"));
        
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return appointmentRepository.findByAppointmentDateBetween(startOfDay, endOfDay)
            .stream()
            .filter(apt -> apt.getDentist() != null && apt.getDentist().getId().equals(dentist.getId()))
            .toList();
    }
}