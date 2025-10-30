package com.dentistplus.repository;

import com.dentistplus.model.Appointment;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatientProfile(PatientProfile patientProfile);
    List<Appointment> findByDentist(User dentist);
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByStatus(String status);
}