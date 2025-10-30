package com.dentistplus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "treatment_plans")
public class TreatmentPlan {
    @Id
    private String id;
    
    @DBRef
    private PatientProfile patientProfile;
    
    private String planName;
    private String description;
    private List<PlannedProcedure> procedures;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Inner class for planned procedures
    public static class PlannedProcedure {
        private String id;
        private String procedureName;
        private String procedureCode;
        private List<String> toothNumbers; // e.g., ["18", "26"]
        private BigDecimal costEstimate;
        private String status; // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
        private String notes;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;

        // Constructors
        public PlannedProcedure() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
            this.status = "PLANNED";
        }

        public PlannedProcedure(String procedureName, String procedureCode, List<String> toothNumbers, BigDecimal costEstimate) {
            this();
            this.procedureName = procedureName;
            this.procedureCode = procedureCode;
            this.toothNumbers = toothNumbers;
            this.costEstimate = costEstimate;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getProcedureName() { return procedureName; }
        public void setProcedureName(String procedureName) { this.procedureName = procedureName; }

        public String getProcedureCode() { return procedureCode; }
        public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

        public List<String> getToothNumbers() { return toothNumbers; }
        public void setToothNumbers(List<String> toothNumbers) { this.toothNumbers = toothNumbers; }

        public BigDecimal getCostEstimate() { return costEstimate; }
        public void setCostEstimate(BigDecimal costEstimate) { this.costEstimate = costEstimate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    // Constructors
    public TreatmentPlan() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public TreatmentPlan(PatientProfile patientProfile, String planName) {
        this();
        this.patientProfile = patientProfile;
        this.planName = planName;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public PatientProfile getPatientProfile() { return patientProfile; }
    public void setPatientProfile(PatientProfile patientProfile) { this.patientProfile = patientProfile; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<PlannedProcedure> getProcedures() { return procedures; }
    public void setProcedures(List<PlannedProcedure> procedures) { this.procedures = procedures; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}