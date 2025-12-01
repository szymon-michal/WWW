package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.model.DentalRecord;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import com.dentistplus.repository.DentalRecordRepository;
import com.dentistplus.repository.PatientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;

@Service
public class DentalRecordService {
    
    @Autowired
    private DentalRecordRepository dentalRecordRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private AuthService authService;

    public DentalRecord getDentalRecord(String patientId, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        return dentalRecordRepository.findByPatientProfile(patient)
            .orElseGet(() -> createEmptyDentalRecord(patient));
    }

    public DentalRecord updateDentalChart(String patientId, Map<String, Map<String, String>> dentalChart, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        DentalRecord record = dentalRecordRepository.findByPatientProfile(patient)
            .orElseGet(() -> createEmptyDentalRecord(patient));

        record.setDentalChart(dentalChart);
        record.setUpdatedAt(LocalDateTime.now());
        
        return dentalRecordRepository.save(record);
    }

    public DentalRecord addAttachment(String patientId, DentalRecord.Attachment attachment, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        DentalRecord record = dentalRecordRepository.findByPatientProfile(patient)
            .orElseGet(() -> createEmptyDentalRecord(patient));

        if (record.getAttachments() == null) {
            record.setAttachments(new ArrayList<>());
        }
        
        record.getAttachments().add(attachment);
        record.setUpdatedAt(LocalDateTime.now());
        
        return dentalRecordRepository.save(record);
    }

    public DentalRecord addClinicalNote(String patientId, String note, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        User dentist = authService.getCurrentUser(dentistUserId);
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        DentalRecord record = dentalRecordRepository.findByPatientProfile(patient)
            .orElseGet(() -> createEmptyDentalRecord(patient));

        if (record.getGeneralNotes() == null) {
            record.setGeneralNotes(new ArrayList<>());
        }
        
        DentalRecord.ClinicalNote clinicalNote = new DentalRecord.ClinicalNote(note, dentist.getUsername());
        record.getGeneralNotes().add(clinicalNote);
        record.setUpdatedAt(LocalDateTime.now());
        
        return dentalRecordRepository.save(record);
    }

    public DentalRecord getMyDentalRecord(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return dentalRecordRepository.findByPatientProfile(patient)
            .orElseGet(() -> createEmptyDentalRecord(patient));
    }

    private DentalRecord createEmptyDentalRecord(PatientProfile patient) {
        DentalRecord record = new DentalRecord(patient);
        record.setAttachments(new ArrayList<>());
        record.setGeneralNotes(new ArrayList<>());
        return dentalRecordRepository.save(record);
    }
}