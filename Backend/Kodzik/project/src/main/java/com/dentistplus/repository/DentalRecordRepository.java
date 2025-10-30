package com.dentistplus.repository;

import com.dentistplus.model.DentalRecord;
import com.dentistplus.model.PatientProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DentalRecordRepository extends MongoRepository<DentalRecord, String> {
    Optional<DentalRecord> findByPatientProfile(PatientProfile patientProfile);
    Optional<DentalRecord> findByPatientProfileId(String patientProfileId);
}