package com.dentistplus.repository;

import com.dentistplus.model.Invoice;
import com.dentistplus.model.PatientProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByPatientProfile(PatientProfile patientProfile);
    List<Invoice> findByPatientProfileId(String patientProfileId);
    List<Invoice> findByStatus(String status);
}