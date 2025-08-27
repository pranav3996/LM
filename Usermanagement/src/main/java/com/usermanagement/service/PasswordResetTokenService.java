package com.usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.usermanagement.entity.PasswordResetToken;
import com.usermanagement.entity.Users;

import com.usermanagement.repo.PasswordResetTokenRepository;

import java.util.Calendar;
import java.util.Optional;

@Service
public class PasswordResetTokenService {

	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;

	public void createPasswordResetTokenForUser(Users user, String passwordToken) {
		// Find existing token for the user
		PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);

		// If a token exists, delete it
		if (existingToken != null) {
			System.out.println("Deleting existing token: " + existingToken);
			passwordResetTokenRepository.delete(existingToken);
		}

		// Create new token and save
		PasswordResetToken passwordResetToken = new PasswordResetToken(passwordToken, user);
		System.out.println("Saving new token: " + passwordResetToken);
		passwordResetTokenRepository.save(passwordResetToken);
	}

	public String validatePasswordResetToken(String passwordResetToken) {
		PasswordResetToken passwordToken = passwordResetTokenRepository.findByToken(passwordResetToken);
		if (passwordToken == null) {
			throw new RuntimeException("Invalid verification token");
		}

		Calendar calendar = Calendar.getInstance();
		if ((passwordToken.getExpirationTime().getTime() - calendar.getTime().getTime()) <= 0) {
			throw new RuntimeException("Link already expired, resend link");
		}
		return "valid";
	}

	public Optional<Users> findUserByPasswordToken(String passwordResetToken) {
		return Optional.ofNullable(passwordResetTokenRepository.findByToken(passwordResetToken).getUser());
	}

	public PasswordResetToken findPasswordResetToken(String token) {
		return passwordResetTokenRepository.findByToken(token);
	}

}
