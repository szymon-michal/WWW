package com.dentistplus.repository;

import com.dentistplus.model.TreatmentPlan;
import com.dentistplus.model.PatientProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentPlanRepository extends MongoRepository<TreatmentPlan, String> {
    List<TreatmentPlan> findByPatientProfile(PatientProfile patientProfile);
    List<TreatmentPlan> findByPatientProfileId(String patientProfileId);
}