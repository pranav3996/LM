package com.usermanagement.controller;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.usermanagement.entity.OTP;
import com.usermanagement.entity.Users;

import com.usermanagement.service.PasswordResetOTPService;
import com.usermanagement.service.UserManagementService;
import com.usermanagement.util.PasswordRequestUtil;

import jakarta.mail.MessagingException;


@RestController
@RequestMapping("/reset")
public class PasswordResetOTPController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetOTPController.class);

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private PasswordResetOTPService passwordResetOTPService;

    @PostMapping("/password-reset-otp-request")
    public ResponseEntity<Map<String, String>> resetPasswordRequest(@RequestBody PasswordRequestUtil passwordRequestUtil) throws MessagingException, UnsupportedEncodingException {
        logger.debug("password-reset-otp-request initiated for email: {}", passwordRequestUtil.getEmail());

        Optional<Users> userOptional = userManagementService.findUserByEmail(passwordRequestUtil.getEmail());
        if (userOptional.isEmpty()) {
            logger.error("No user found with the provided email: {}", passwordRequestUtil.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "No user found with the provided email.");
//            throw new UserNotFoundException("No user found with the provided email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Users user = userOptional.get();
        // Generate OTP and send it via email
        String otp;
        try {
            otp = passwordResetOTPService.generateOrRegenerateOtp(user,true);
        } catch (Exception e) {
            logger.error("Error generating OTP for email: {}", passwordRequestUtil.getEmail(), e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error generating OTP.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
        
        logger.debug("Generated OTP: {}", otp);

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to the provided email address and please verify account within 1 minute.");
        response.put("otp", otp);  // For debugging purposes; remove in production
        return ResponseEntity.ok(response);
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyAccount(@RequestParam String email, @RequestParam String otp) {
        logger.debug("Verify OTP for email: {}", email);

        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            logger.error("No user found with the provided email: {}", email);
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "No user found with the provided email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Users user = userOptional.get();
        Map<String, String> response = new HashMap<>();
        try {
            passwordResetOTPService.verifyOTP(user, otp);
            response.put("success", "true");
            response.put("message", "OTP verified successfully.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to verify OTP for user: {}", user.getEmail(), e);
            response.put("success", "false");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    @PostMapping("/regenerate-otp")
    public ResponseEntity<Map<String, String>> regenerateOtp(@RequestParam String email) {
        logger.debug("Regenerating OTP for email: {}", email);

        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            logger.error("No user found with the provided email: {}", email);
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "No user found with the provided email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Users user = userOptional.get();
        String otp;
        Map<String, String> response = new HashMap<>();
        try {
            otp = passwordResetOTPService.generateOrRegenerateOtp(user, false);
            response.put("success", "true");
            response.put("message", "OTP re-sent to the provided email address and please verify account within 1 minute.");
            response.put("otp", otp);
        } catch (Exception e) {
            logger.error("Error regenerating OTP for email: {}", email, e);
            response.put("success", "false");
            response.put("message", "Error regenerating OTP.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password-otp")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody PasswordRequestUtil passwordRequestUtil, @RequestParam("email") String email, @RequestParam("otp") String otp) {
        logger.debug("Resetting password for email: {}", email);

        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            logger.error("No user found with the provided email: {}", email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "No user found with the provided email.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Users user = userOptional.get();
        OTP otpEntity = passwordResetOTPService.getOtpByUser(user);

        if (!otpEntity.isOtpVerified()) {
            logger.error("OTP not verified for user: {}", user.getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP not verified.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            passwordResetOTPService.verifyOTP(user, otp);
        } catch (RuntimeException e) {
            logger.error("Failed to verify OTP for user: {}", user.getEmail(), e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid OTP.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        userManagementService.resetChangePassword(user, passwordRequestUtil.getNewPassword());
        otpEntity.setOtpVerified(false);  // Reset the OTP verified flag
       passwordResetOTPService.saveOtp(otpEntity);  // Save the OTP entity with the updated flag

        logger.debug("Password has been reset successfully for user: {}", user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully.");
        return ResponseEntity.ok(response);
    }





}
