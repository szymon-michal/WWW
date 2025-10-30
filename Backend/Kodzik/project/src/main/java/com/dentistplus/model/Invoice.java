package com.dentistplus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    
    @DBRef
    private PatientProfile patientProfile;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;
    
    private List<LineItem> lineItems;
    private BigDecimal totalAmount;
    private String status; // PAID, UNPAID, PARTIAL
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Inner class for line items
    public static class LineItem {
        private String description;
        private BigDecimal cost;
        private Integer quantity;
        private String procedureCode;

        // Constructors
        public LineItem() {}

        public LineItem(String description, BigDecimal cost, Integer quantity) {
            this.description = description;
            this.cost = cost;
            this.quantity = quantity;
        }

        // Getters and Setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getProcedureCode() { return procedureCode; }
        public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }
    }

    // Constructors
    public Invoice() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "UNPAID";
    }

    public Invoice(PatientProfile patientProfile, LocalDate issueDate) {
        this();
        this.patientProfile = patientProfile;
        this.issueDate = issueDate;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public PatientProfile getPatientProfile() { return patientProfile; }
    public void setPatientProfile(PatientProfile patientProfile) { this.patientProfile = patientProfile; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public List<LineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<LineItem> lineItems) { this.lineItems = lineItems; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}