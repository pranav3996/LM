package com.usermanagement.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.usermanagement.entity.Users;

import java.util.Optional;

public interface UsersRepo extends JpaRepository<Users, Integer> {

	Optional<Users> findByEmail(String email);
}