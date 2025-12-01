package com.dentistplus.service;

import com.dentistplus.dto.DentistRegistrationRequest;
import com.dentistplus.dto.LoginRequest;
import com.dentistplus.dto.PatientRegistrationRequest;
import com.dentistplus.exception.UnauthorizedException;
import com.dentistplus.model.PatientProfile;
import com.dentistplus.model.User;
import com.dentistplus.repository.PatientProfileRepository;
import com.dentistplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PatientProfileRepository patientProfileRepository;

    public User login(LoginRequest loginRequest) {
        System.out.println("AuthService: Login attempt for username: " + loginRequest.getUsername());
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            System.out.println("AuthService: User not found: " + loginRequest.getUsername());
            throw new UnauthorizedException("Invalid username or password");
        }
        
        User user = userOpt.get();
        System.out.println("AuthService: User found. Stored password: [" + user.getPassword() + "], Provided password: [" + loginRequest.getPassword() + "]");
        
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            System.out.println("AuthService: Password mismatch for user: " + loginRequest.getUsername());
            throw new UnauthorizedException("Invalid username or password");
        }
        
        System.out.println("AuthService: Login successful for user: " + loginRequest.getUsername());
        return user;
    }

    public User registerPatient(PatientRegistrationRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user with ROLE_PATIENT
        User user = new User(
            request.getUsername(),
            request.getPassword(),
            request.getEmail(),
            Arrays.asList("ROLE_PATIENT")
        );
        user = userRepository.save(user);

        // Create patient profile
        PatientProfile patientProfile = new PatientProfile(
            user,
            request.getFirstName(),
            request.getLastName(),
            request.getDateOfBirth()
        );
        patientProfile.setContactPhone(request.getContactPhone());
        patientProfile.setAddress(request.getAddress());
        patientProfileRepository.save(patientProfile);

        return user;
    }

    public User registerDentist(DentistRegistrationRequest request, String adminUserId) {
        // Check if the requesting user is an admin
        User admin = userRepository.findById(adminUserId)
            .orElseThrow(() -> new UnauthorizedException("Invalid user"));
        
        if (!admin.getRoles().contains("ROLE_ADMIN")) {
            throw new UnauthorizedException("Only administrators can create dentist accounts");
        }

        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user with ROLE_DENTIST
        User user = new User(
            request.getUsername(),
            request.getPassword(),
            request.getEmail(),
            Arrays.asList("ROLE_DENTIST")
        );
        return userRepository.save(user);
    }

    public void validateUserRole(String userId, String requiredRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("Invalid user"));
        
        if (!user.getRoles().contains(requiredRole)) {
            throw new UnauthorizedException("Insufficient permissions. Required role: " + requiredRole);
        }
    }

    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("Invalid user"));
    }
}