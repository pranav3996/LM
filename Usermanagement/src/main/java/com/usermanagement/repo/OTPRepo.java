package com.usermanagement.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.usermanagement.entity.OTP;
import com.usermanagement.entity.Users;

import jakarta.transaction.Transactional;

public interface OTPRepo extends JpaRepository<OTP, Integer> {

	@Modifying
	@Transactional
	@Query("DELETE FROM OTP prt WHERE prt.user.id = :userId")
	void deleteByUserId(@Param("userId") Integer userId);

	Optional<OTP> findByUser(Users user);
}