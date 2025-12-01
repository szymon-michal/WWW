package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.TreatmentPlan;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.TreatmentPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TreatmentPlanService {
    
    @Autowired
    private TreatmentPlanRepository treatmentPlanRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private AuthService authService;

    public List<TreatmentPlan> getTreatmentPlans(String patientId, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        return treatmentPlanRepository.findByPatientProfile(patient);
    }

    public TreatmentPlan createTreatmentPlan(String patientId, TreatmentPlan treatmentPlan, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        treatmentPlan.setPatientProfile(patient);
        if (treatmentPlan.getProcedures() == null) {
            treatmentPlan.setProcedures(new ArrayList<>());
        }
        
        return treatmentPlanRepository.save(treatmentPlan);
    }

    public TreatmentPlan addProcedureToTreatmentPlan(String planId, TreatmentPlan.PlannedProcedure procedure, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        TreatmentPlan plan = treatmentPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Treatment plan not found with id: " + planId));

        if (plan.getProcedures() == null) {
            plan.setProcedures(new ArrayList<>());
        }
        
        procedure.setId(UUID.randomUUID().toString());
        plan.getProcedures().add(procedure);
        plan.setUpdatedAt(LocalDateTime.now());
        
        return treatmentPlanRepository.save(plan);
    }

    public TreatmentPlan updateProcedure(String procedureId, TreatmentPlan.PlannedProcedure updatedProcedure, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        List<TreatmentPlan> allPlans = treatmentPlanRepository.findAll();
        
        for (TreatmentPlan plan : allPlans) {
            if (plan.getProcedures() != null) {
                for (int i = 0; i < plan.getProcedures().size(); i++) {
                    TreatmentPlan.PlannedProcedure procedure = plan.getProcedures().get(i);
                    if (procedureId.equals(procedure.getId())) {
                        // Update the procedure
                        updatedProcedure.setId(procedureId);
                        updatedProcedure.setUpdatedAt(LocalDateTime.now());
                        plan.getProcedures().set(i, updatedProcedure);
                        plan.setUpdatedAt(LocalDateTime.now());
                        return treatmentPlanRepository.save(plan);
                    }
                }
            }
        }
        
        throw new ResourceNotFoundException("Procedure not found with id: " + procedureId);
    }

    public List<TreatmentPlan> getMyTreatmentPlans(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return treatmentPlanRepository.findByPatientProfile(patient);
    }
}