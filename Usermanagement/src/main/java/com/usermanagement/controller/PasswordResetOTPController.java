package com.usermanagement.controller;

import com.usermanagement.entity.OTP;
import com.usermanagement.entity.Users;
import com.usermanagement.service.PasswordResetOTPService;
import com.usermanagement.service.UserManagementService;
import com.usermanagement.util.PasswordRequestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/reset")
public class PasswordResetOTPController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetOTPController.class);

    private final UserManagementService userManagementService;
    private final PasswordResetOTPService passwordResetOTPService;

    public PasswordResetOTPController(UserManagementService userManagementService,
                                      PasswordResetOTPService passwordResetOTPService) {
        this.userManagementService = userManagementService;
        this.passwordResetOTPService = passwordResetOTPService;
    }

    @PostMapping("/password-reset-otp-request")
    public ResponseEntity<Map<String, String>> resetPasswordRequest(
            @RequestBody PasswordRequestUtil passwordRequestUtil) {
        Optional<Users> userOptional = userManagementService.findUserByEmail(passwordRequestUtil.getEmail());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user found with the provided email."));
        }
        try {
            passwordResetOTPService.generateOrRegenerateOtp(userOptional.get(), true);
        } catch (Exception e) {
            logger.error("Error generating OTP for email: {}", passwordRequestUtil.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating OTP."));
        }
        return ResponseEntity.ok(Map.of("message",
                "OTP sent to the provided email address. Please verify within 1 minute."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyAccount(@RequestParam String email,
                                                             @RequestParam String otp) {
        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", "false", "message", "No user found with the provided email."));
        }
        try {
            passwordResetOTPService.verifyOTP(userOptional.get(), otp);
            return ResponseEntity.ok(Map.of("success", "true", "message", "OTP verified successfully."));
        } catch (RuntimeException e) {
            logger.error("Failed to verify OTP for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", "false", "message", e.getMessage()));
        }
    }

    @PostMapping("/regenerate-otp")
    public ResponseEntity<Map<String, String>> regenerateOtp(@RequestParam String email) {
        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", "false", "message", "No user found with the provided email."));
        }
        try {
            passwordResetOTPService.generateOrRegenerateOtp(userOptional.get(), false);
            return ResponseEntity.ok(Map.of("success", "true",
                    "message", "OTP re-sent to the provided email address. Please verify within 1 minute."));
        } catch (Exception e) {
            logger.error("Error regenerating OTP for email: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "Error regenerating OTP."));
        }
    }

    @PostMapping("/reset-password-otp")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody PasswordRequestUtil passwordRequestUtil,
                                                             @RequestParam("email") String email,
                                                             @RequestParam("otp") String otp) {
        Optional<Users> userOptional = userManagementService.findUserByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user found with the provided email."));
        }
        Users user = userOptional.get();
        OTP otpEntity = passwordResetOTPService.getOtpByUser(user);

        if (!otpEntity.isOtpVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "OTP not verified."));
        }
        try {
            passwordResetOTPService.verifyOTP(user, otp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid OTP."));
        }

        userManagementService.resetChangePassword(user, passwordRequestUtil.getNewPassword());
        otpEntity.setOtpVerified(false);
        passwordResetOTPService.saveOtp(otpEntity);
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }
}
