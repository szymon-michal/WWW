package com.dentistplus.repository;

import com.dentistplus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRolesContaining(String role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}