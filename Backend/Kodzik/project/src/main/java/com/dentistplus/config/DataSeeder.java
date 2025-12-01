package com.dentistplus.config;

import com.dentistplus.model.*;
import com.dentistplus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    
    @Autowired
    private DentalRecordRepository dentalRecordRepository;
    
    @Autowired
    private TreatmentPlanRepository treatmentPlanRepository;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        long userCount = userRepository.count();
        System.out.println("DataSeeder: Checking database... User count: " + userCount);
        
        if (userCount > 0) {
            System.out.println("DataSeeder: Database already has " + userCount + " users. Skipping seeding.");
            return;
        }

        System.out.println("DataSeeder: Starting to seed sample data...");

        // Create admin user
        User admin = new User("admin", "admin123", "admin@dentistplus.com", "Admin", "User", Arrays.asList("ROLE_ADMIN"));
        admin = userRepository.save(admin);
        System.out.println("DataSeeder: Created admin user with ID: " + admin.getId());

        // Create dentist users
        User dentist1 = new User("dr.smith", "password123", "dr.smith@dentistplus.com", "John", "Smith", Arrays.asList("ROLE_DENTIST"));
        User dentist2 = new User("dr.jones", "password123", "dr.jones@dentistplus.com", "Sarah", "Jones", Arrays.asList("ROLE_DENTIST"));
        dentist1 = userRepository.save(dentist1);
        dentist2 = userRepository.save(dentist2);
        System.out.println("DataSeeder: Created 2 dentist users: " + dentist1.getId() + ", " + dentist2.getId());

        // Create patient users
        User patient1User = new User("john.doe", "patient123", "john.doe@email.com", Arrays.asList("ROLE_PATIENT"));
        User patient2User = new User("jane.smith", "patient123", "jane.smith@email.com", Arrays.asList("ROLE_PATIENT"));
        User patient3User = new User("bob.johnson", "patient123", "bob.johnson@email.com", Arrays.asList("ROLE_PATIENT"));
        patient1User = userRepository.save(patient1User);
        patient2User = userRepository.save(patient2User);
        patient3User = userRepository.save(patient3User);
        System.out.println("DataSeeder: Created 3 patient users: " + patient1User.getId() + ", " + patient2User.getId() + ", " + patient3User.getId());

        // Create patient profiles
        PatientProfile patient1 = new PatientProfile(patient1User, "John", "Doe", LocalDate.of(1985, 3, 15));
        patient1.setContactPhone("555-0101");
        patient1.setAddress("123 Main St, Anytown, USA 12345");
        patient1.setMedicalHistorySummary("No significant medical history. Mild anxiety during dental procedures.");
        patient1.setInsuranceDetails("DeltaDental - Policy #DD123456789");
        patient1 = patientProfileRepository.save(patient1);

        PatientProfile patient2 = new PatientProfile(patient2User, "Jane", "Smith", LocalDate.of(1992, 7, 22));
        patient2.setContactPhone("555-0102");
        patient2.setAddress("456 Oak Ave, Somewhere, USA 67890");
        patient2.setMedicalHistorySummary("Diabetes Type 2, controlled with medication. Previous heart surgery in 2018.");
        patient2.setInsuranceDetails("Aetna - Policy #AE987654321");
        patient2 = patientProfileRepository.save(patient2);

        PatientProfile patient3 = new PatientProfile(patient3User, "Bob", "Johnson", LocalDate.of(1978, 11, 8));
        patient3.setContactPhone("555-0103");
        patient3.setAddress("789 Pine Rd, Elsewhere, USA 54321");
        patient3.setMedicalHistorySummary("High blood pressure, takes medication. Allergic to penicillin.");
        patient3.setInsuranceDetails("Cigna - Policy #CI456789123");
        patient3 = patientProfileRepository.save(patient3);

        // Create dental records
        createDentalRecord(patient1, dentist1);
        createDentalRecord(patient2, dentist2);
        createDentalRecord(patient3, dentist1);

        // Create treatment plans
        createTreatmentPlan(patient1);
        createTreatmentPlan(patient2);
        createTreatmentPlan(patient3);

        // Create some sample appointments
        createAppointments(patient1, dentist1);
        createAppointments(patient2, dentist2);
        createAppointments(patient3, dentist1);

        // Create invoices for completed treatments
        createInvoices(patient1);
        createInvoices(patient2);
        createInvoices(patient3);

        // Final verification
        long finalUserCount = userRepository.count();
        System.out.println("DataSeeder: Sample data seeded successfully! Total users in database: " + finalUserCount);
    }

    private void createDentalRecord(PatientProfile patient, User dentist) {
        DentalRecord record = new DentalRecord(patient);
        
        // Create sample dental chart
        Map<String, Map<String, String>> dentalChart = new HashMap<>();
        
        // Add some sample teeth conditions
        Map<String, String> tooth18 = new HashMap<>();
        tooth18.put("occlusal", "FILLING");
        tooth18.put("buccal", "HEALTHY");
        tooth18.put("lingual", "HEALTHY");
        tooth18.put("mesial", "HEALTHY");
        tooth18.put("distal", "HEALTHY");
        dentalChart.put("tooth_18", tooth18);
        
        Map<String, String> tooth17 = new HashMap<>();
        tooth17.put("occlusal", "CARIES");
        tooth17.put("buccal", "HEALTHY");
        tooth17.put("lingual", "PLAQUE");
        tooth17.put("mesial", "HEALTHY");
        tooth17.put("distal", "HEALTHY");
        dentalChart.put("tooth_17", tooth17);
        
        record.setDentalChart(dentalChart);
        
        // Add sample attachments
        List<DentalRecord.Attachment> attachments = new ArrayList<>();
        attachments.add(new DentalRecord.Attachment(
            "panto_" + patient.getFirstName().toLowerCase() + "_2023.jpg",
            "PANTOMOGRAPHIC",
            "/storage/images/panto_" + patient.getId() + "_2023.jpg"
        ));
        attachments.add(new DentalRecord.Attachment(
            "intraoral_" + patient.getFirstName().toLowerCase() + "_2023.jpg",
            "INTRAORAL",
            "/storage/images/intraoral_" + patient.getId() + "_2023.jpg"
        ));
        record.setAttachments(attachments);
        
        // Add sample clinical notes
        List<DentalRecord.ClinicalNote> notes = new ArrayList<>();
        notes.add(new DentalRecord.ClinicalNote(
            "Initial examination completed. Good oral hygiene. Recommending regular cleanings every 6 months.",
            dentist.getUsername()
        ));
        notes.add(new DentalRecord.ClinicalNote(
            "Tooth #17 shows signs of decay. Treatment plan created for composite filling.",
            dentist.getUsername()
        ));
        record.setGeneralNotes(notes);
        
        dentalRecordRepository.save(record);
    }

    private void createTreatmentPlan(PatientProfile patient) {
        TreatmentPlan plan = new TreatmentPlan(patient, "2024 Treatment Plan");
        plan.setDescription("Comprehensive treatment plan for " + patient.getFirstName() + " " + patient.getLastName());
        
        List<TreatmentPlan.PlannedProcedure> procedures = new ArrayList<>();
        
        // Add different procedures based on patient
        if ("John".equals(patient.getFirstName())) {
            TreatmentPlan.PlannedProcedure procedure1 = new TreatmentPlan.PlannedProcedure(
                "Composite Filling", "D2391", Arrays.asList("17"), new BigDecimal("150.00")
            );
            procedure1.setId("proc_1_" + UUID.randomUUID());
            procedure1.setStatus("COMPLETED");
            procedure1.setScheduledDate(LocalDateTime.now().minusDays(30));
            procedures.add(procedure1);
            
            TreatmentPlan.PlannedProcedure procedure2 = new TreatmentPlan.PlannedProcedure(
                "Dental Cleaning", "D1110", Arrays.asList(), new BigDecimal("80.00")
            );
            procedure2.setId("proc_2_" + UUID.randomUUID());
            procedure2.setStatus("COMPLETED");
            procedure2.setScheduledDate(LocalDateTime.now().minusDays(45));
            procedures.add(procedure2);

            // Align treatment plan with all John's appointments
            TreatmentPlan.PlannedProcedure procedure3 = new TreatmentPlan.PlannedProcedure(
                "Initial Consultation", "D0150", Arrays.asList(), new BigDecimal("100.00")
            );
            procedure3.setId("proc_7_" + UUID.randomUUID());
            procedure3.setStatus("COMPLETED");
            procedure3.setScheduledDate(LocalDateTime.now().minusDays(60));
            procedures.add(procedure3);

            TreatmentPlan.PlannedProcedure procedure4 = new TreatmentPlan.PlannedProcedure(
                "Follow-up Checkup", "D0120", Arrays.asList(), new BigDecimal("60.00")
            );
            procedure4.setId("proc_8_" + UUID.randomUUID());
            procedure4.setStatus("PLANNED");
            procedure4.setScheduledDate(LocalDateTime.now().plusDays(7));
            procedures.add(procedure4);

            TreatmentPlan.PlannedProcedure procedure5 = new TreatmentPlan.PlannedProcedure(
                "Routine Cleaning", "D1110", Arrays.asList(), new BigDecimal("80.00")
            );
            procedure5.setId("proc_9_" + UUID.randomUUID());
            procedure5.setStatus("PLANNED");
            procedure5.setScheduledDate(LocalDateTime.now().plusDays(21));
            procedures.add(procedure5);

            TreatmentPlan.PlannedProcedure procedure6 = new TreatmentPlan.PlannedProcedure(
                "Whitening Treatment", "D9975", Arrays.asList(), new BigDecimal("300.00")
            );
            procedure6.setId("proc_10_" + UUID.randomUUID());
            procedure6.setStatus("PLANNED");
            procedure6.setScheduledDate(LocalDateTime.now().plusDays(45));
            procedures.add(procedure6);
        } else if ("Jane".equals(patient.getFirstName())) {
            TreatmentPlan.PlannedProcedure procedure1 = new TreatmentPlan.PlannedProcedure(
                "Crown", "D2740", Arrays.asList("14"), new BigDecimal("800.00")
            );
            procedure1.setId("proc_3_" + UUID.randomUUID());
            procedure1.setStatus("IN_PROGRESS");
            procedures.add(procedure1);
            
            TreatmentPlan.PlannedProcedure procedure2 = new TreatmentPlan.PlannedProcedure(
                "Root Canal", "D3310", Arrays.asList("14"), new BigDecimal("950.00")
            );
            procedure2.setId("proc_4_" + UUID.randomUUID());
            procedure2.setStatus("COMPLETED");
            procedures.add(procedure2);
        } else {
            TreatmentPlan.PlannedProcedure procedure1 = new TreatmentPlan.PlannedProcedure(
                "Extraction", "D7140", Arrays.asList("32"), new BigDecimal("200.00")
            );
            procedure1.setId("proc_5_" + UUID.randomUUID());
            procedures.add(procedure1);
            
            TreatmentPlan.PlannedProcedure procedure2 = new TreatmentPlan.PlannedProcedure(
                "Dental Cleaning", "D1110", Arrays.asList(), new BigDecimal("80.00")
            );
            procedure2.setId("proc_6_" + UUID.randomUUID());
            procedure2.setStatus("COMPLETED");
            procedures.add(procedure2);
        }
        
        plan.setProcedures(procedures);
        treatmentPlanRepository.save(plan);
    }

    private void createAppointments(PatientProfile patient, User dentist) {
        // Only create multiple appointments for John Doe
        if ("John".equals(patient.getFirstName()) && "Doe".equals(patient.getLastName())) {
            // Past appointments
            Appointment past1 = new Appointment(
                patient, dentist,
                LocalDateTime.now().minusDays(60),
                "Initial Consultation"
            );
            past1.setStatus("COMPLETED");
            past1.setDurationMinutes(30);
            past1.setNotes("Initial examination. Patient has good oral hygiene.");
            appointmentRepository.save(past1);

            Appointment past2 = new Appointment(
                patient, dentist,
                LocalDateTime.now().minusDays(45),
                "Dental Cleaning"
            );
            past2.setStatus("COMPLETED");
            past2.setDurationMinutes(45);
            past2.setNotes("Professional cleaning completed. Minor tartar buildup removed.");
            appointmentRepository.save(past2);

            Appointment past3 = new Appointment(
                patient, dentist,
                LocalDateTime.now().minusDays(30),
                "Cavity Filling"
            );
            past3.setStatus("COMPLETED");
            past3.setDurationMinutes(60);
            past3.setNotes("Composite filling on tooth #17 completed successfully.");
            appointmentRepository.save(past3);

            // Upcoming appointments
            Appointment upcoming1 = new Appointment(
                patient, dentist,
                LocalDateTime.now().plusDays(7),
                "Follow-up Checkup"
            );
            upcoming1.setStatus("CONFIRMED");
            upcoming1.setDurationMinutes(30);
            upcoming1.setNotes("Follow-up to check healing of tooth #17 after filling.");
            appointmentRepository.save(upcoming1);

            Appointment upcoming2 = new Appointment(
                patient, dentist,
                LocalDateTime.now().plusDays(21),
                "Routine Cleaning"
            );
            upcoming2.setStatus("SCHEDULED");
            upcoming2.setDurationMinutes(45);
            upcoming2.setNotes("Six-month routine cleaning and examination.");
            appointmentRepository.save(upcoming2);

            Appointment upcoming3 = new Appointment(
                patient, dentist,
                LocalDateTime.now().plusDays(45),
                "Whitening Treatment"
            );
            upcoming3.setStatus("SCHEDULED");
            upcoming3.setDurationMinutes(90);
            upcoming3.setNotes("Professional teeth whitening session. Patient requested cosmetic treatment.");
            appointmentRepository.save(upcoming3);
        } else {
            // Default appointments for other patients
            Appointment pastAppointment = new Appointment(
                patient, dentist,
                LocalDateTime.now().minusDays(30),
                "Regular Checkup"
            );
            pastAppointment.setStatus("COMPLETED");
            pastAppointment.setNotes("Routine examination and cleaning completed successfully.");
            appointmentRepository.save(pastAppointment);

            Appointment futureAppointment = new Appointment(
                patient, dentist,
                LocalDateTime.now().plusDays(15),
                "Follow-up Treatment"
            );
            futureAppointment.setDurationMinutes(60);
            futureAppointment.setNotes("Follow-up for ongoing treatment plan.");
            appointmentRepository.save(futureAppointment);
        }
    }

    private void createInvoices(PatientProfile patient) {
        // Create invoices for completed treatments
        if ("John".equals(patient.getFirstName())) {
            // Invoice 1: Initial Consultation (60 days ago) - PAID
            Invoice invoice1 = new Invoice(patient, LocalDate.now().minusDays(60));
            List<Invoice.LineItem> items1 = new ArrayList<>();
            items1.add(new Invoice.LineItem("Initial Consultation", new BigDecimal("100.00"), 1));
            invoice1.setLineItems(items1);
            invoice1.setTotalAmount(new BigDecimal("100.00"));
            invoice1.setStatus("PAID");
            invoiceRepository.save(invoice1);

            // Invoice 2: Dental Cleaning (45 days ago) - UNPAID
            Invoice invoice2 = new Invoice(patient, LocalDate.now().minusDays(45));
            List<Invoice.LineItem> items2 = new ArrayList<>();
            items2.add(new Invoice.LineItem("Dental Cleaning", new BigDecimal("80.00"), 1));
            invoice2.setLineItems(items2);
            invoice2.setTotalAmount(new BigDecimal("80.00"));
            invoice2.setStatus("UNPAID");
            invoiceRepository.save(invoice2);

            // Invoice 3: Composite Filling (30 days ago) - PAID
            Invoice invoice3 = new Invoice(patient, LocalDate.now().minusDays(30));
            List<Invoice.LineItem> items3 = new ArrayList<>();
            items3.add(new Invoice.LineItem("Composite Filling - Tooth 17", new BigDecimal("150.00"), 1));
            invoice3.setLineItems(items3);
            invoice3.setTotalAmount(new BigDecimal("150.00"));
            invoice3.setStatus("PAID");
            invoiceRepository.save(invoice3);
        } else if ("Jane".equals(patient.getFirstName())) {
            // Invoice for Root Canal
            Invoice invoice = new Invoice(patient, LocalDate.now().minusDays(20));
            List<Invoice.LineItem> items = new ArrayList<>();
            items.add(new Invoice.LineItem("Root Canal - Tooth 14", new BigDecimal("950.00"), 1));
            invoice.setLineItems(items);
            invoice.setTotalAmount(new BigDecimal("950.00"));
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
        } else if ("Bob".equals(patient.getFirstName())) {
            // Invoice for Dental Cleaning
            Invoice invoice = new Invoice(patient, LocalDate.now().minusDays(30));
            List<Invoice.LineItem> items = new ArrayList<>();
            items.add(new Invoice.LineItem("Dental Cleaning", new BigDecimal("80.00"), 1));
            invoice.setLineItems(items);
            invoice.setTotalAmount(new BigDecimal("80.00"));
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
        }
    }
}