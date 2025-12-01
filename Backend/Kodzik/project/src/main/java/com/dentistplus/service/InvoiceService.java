package com.dentistplus.service;

import com.dentistplus.dto.PaymentRequest;
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
import java.time.LocalDateTime;
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
        
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return invoiceRepository.findByPatientProfile(patient);
    }

    public List<Invoice> processPayment(String patientUserId, PaymentRequest paymentRequest) {
        authService.validateUserRole(patientUserId, "ROLE_PATIENT");
        
        PatientProfile patient = patientProfileRepository.findByUser_Id(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        List<Invoice> updatedInvoices = new ArrayList<>();

        for (String invoiceId : paymentRequest.getInvoiceIds()) {
            Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

            // Verify invoice belongs to this patient
            if (!invoice.getPatientProfile().getId().equals(patient.getId())) {
                throw new IllegalArgumentException("Invoice does not belong to this patient");
            }

            // Process payment (in real app, would integrate with payment gateway)
            // For now, just mark as PAID
            invoice.setStatus("PAID");
            invoice.setUpdatedAt(LocalDateTime.now());
            
            Invoice saved = invoiceRepository.save(invoice);
            updatedInvoices.add(saved);
        }

        return updatedInvoices;
    }
}