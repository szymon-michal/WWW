package com.dentistplus.repository;

import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientProfileRepository extends MongoRepository<PatientProfile, String> {
    Optional<PatientProfile> findByUser(User user);
    Optional<PatientProfile> findByUserId(String userId);
    List<PatientProfile> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
}