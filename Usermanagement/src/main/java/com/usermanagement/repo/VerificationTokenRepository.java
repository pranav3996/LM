package com.usermanagement.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.usermanagement.entity.VerificationToken;

import jakarta.transaction.Transactional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Integer> {
	VerificationToken findByToken(String token);

	@Modifying
	@Transactional
	@Query("DELETE FROM VerificationToken vt WHERE vt.user.id = :userId")
	void deleteByUserId(@Param("userId") Integer userId);
}
