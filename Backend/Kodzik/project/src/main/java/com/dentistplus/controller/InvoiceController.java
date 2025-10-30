package com.dentistplus.controller;

import com.dentistplus.model.Invoice;
import com.dentistplus.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Billing & Invoices", description = "Invoice and billing management endpoints")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/patients/{patientId}/invoices")
    @Operation(summary = "Generate invoice", description = "Generate an invoice from completed procedures (ROLE_DENTIST required)")
    public ResponseEntity<Invoice> generateInvoice(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        Invoice invoice = invoiceService.createInvoice(patientId, dentistUserId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/patients/{patientId}/invoices")
    @Operation(summary = "Get patient invoices", description = "Get all invoices for a patient (ROLE_DENTIST required)")
    public ResponseEntity<List<Invoice>> getPatientInvoices(
            @Parameter(description = "Patient ID", required = true)
            @PathVariable String patientId,
            @Parameter(description = "Dentist user ID", required = true)
            @RequestHeader("X-User-ID") String dentistUserId) {
        
        List<Invoice> invoices = invoiceService.getPatientInvoices(patientId, dentistUserId);
        return ResponseEntity.ok(invoices);
    }
}