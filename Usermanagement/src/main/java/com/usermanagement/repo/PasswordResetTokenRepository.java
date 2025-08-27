package com.usermanagement.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.usermanagement.entity.PasswordResetToken;
import com.usermanagement.entity.Users;

import jakarta.transaction.Transactional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
	PasswordResetToken findByToken(String passwordResetToken);

	@Modifying
	@Transactional
	@Query("DELETE FROM PasswordResetToken prt WHERE prt.user.id = :userId")
	void deleteByUserId(@Param("userId") Integer userId);

	PasswordResetToken findByUser(Users user);
}