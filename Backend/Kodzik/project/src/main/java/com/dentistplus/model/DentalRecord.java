package com.dentistplus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "dental_records")
public class DentalRecord {
    @Id
    private String id;
    
    @DBRef
    private PatientProfile patientProfile;
    
    // JSON object mapping teeth to their surface conditions
    // Example: {"tooth_18": {"occlusal": "HEALTHY", "buccal": "FILLING"}}
    private Map<String, Map<String, String>> dentalChart;
    
    private List<Attachment> attachments;
    private List<ClinicalNote> generalNotes;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Inner classes
    public static class Attachment {
        private String filename;
        private String fileType; // PANTOMOGRAPHIC, INTRAORAL, XRAY, etc.
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime uploadDate;
        private String storageUrl;

        // Constructors
        public Attachment() {
            this.uploadDate = LocalDateTime.now();
        }

        public Attachment(String filename, String fileType, String storageUrl) {
            this();
            this.filename = filename;
            this.fileType = fileType;
            this.storageUrl = storageUrl;
        }

        // Getters and Setters
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public LocalDateTime getUploadDate() { return uploadDate; }
        public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

        public String getStorageUrl() { return storageUrl; }
        public void setStorageUrl(String storageUrl) { this.storageUrl = storageUrl; }
    }

    public static class ClinicalNote {
        private String note;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime timestamp;
        private String dentistName;

        // Constructors
        public ClinicalNote() {
            this.timestamp = LocalDateTime.now();
        }

        public ClinicalNote(String note, String dentistName) {
            this();
            this.note = note;
            this.dentistName = dentistName;
        }

        // Getters and Setters
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public String getDentistName() { return dentistName; }
        public void setDentistName(String dentistName) { this.dentistName = dentistName; }
    }

    // Constructors
    public DentalRecord() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public DentalRecord(PatientProfile patientProfile) {
        this();
        this.patientProfile = patientProfile;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public PatientProfile getPatientProfile() { return patientProfile; }
    public void setPatientProfile(PatientProfile patientProfile) { this.patientProfile = patientProfile; }

    public Map<String, Map<String, String>> getDentalChart() { return dentalChart; }
    public void setDentalChart(Map<String, Map<String, String>> dentalChart) { this.dentalChart = dentalChart; }

    public List<Attachment> getAttachments() { return attachments; }
    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }

    public List<ClinicalNote> getGeneralNotes() { return generalNotes; }
    public void setGeneralNotes(List<ClinicalNote> generalNotes) { this.generalNotes = generalNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}