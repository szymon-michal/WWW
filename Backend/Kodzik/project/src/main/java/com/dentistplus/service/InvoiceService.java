package com.dentistplus.service;

import com.dentistplus.exception.ResourceNotFoundException;
import com.dentistplus.model.Invoice;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.TreatmentPlan;
import com.dentistplus.repository.InvoiceRepository;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.TreatmentPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoiceService {
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private TreatmentPlanRepository treatmentPlanRepository;
    
    @Autowired
    private AuthService authService;

    public Invoice createInvoice(String patientId, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Get all completed procedures from treatment plans
        List<TreatmentPlan> treatmentPlans = treatmentPlanRepository.findByPatientProfile(patient);
        List<Invoice.LineItem> lineItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (TreatmentPlan plan : treatmentPlans) {
            if (plan.getProcedures() != null) {
                for (TreatmentPlan.PlannedProcedure procedure : plan.getProcedures()) {
                    if ("COMPLETED".equals(procedure.getStatus())) {
                        Invoice.LineItem lineItem = new Invoice.LineItem(
                            procedure.getProcedureName(),
                            procedure.getCostEstimate(),
                            1
                        );
                        lineItem.setProcedureCode(procedure.getProcedureCode());
                        lineItems.add(lineItem);
                        totalAmount = totalAmount.add(procedure.getCostEstimate());
                    }
                }
            }
        }

        Invoice invoice = new Invoice(patient, LocalDate.now());
        invoice.setLineItems(lineItems);
        invoice.setTotalAmount(totalAmount);
        
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getPatientInvoices(String patientId, String dentistUserId) {
        authService.validateUserRole(dentistUserId, "ROLE_DENTIST");
        
        PatientProfile patient = patientProfileRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        return invoiceRepository.findByPatientProfile(patient);
    }

    public List<Invoice> getMyInvoices(String patientUserId) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUserId(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return invoiceRepository.findByPatientProfile(patient);
    }
}