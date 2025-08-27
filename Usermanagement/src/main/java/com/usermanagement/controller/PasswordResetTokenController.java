package com.usermanagement.controller;

import com.usermanagement.entity.Users;
import com.usermanagement.event.listener.RegistrationCompleteEventListener;

import com.usermanagement.service.UserManagementService;
import com.usermanagement.util.PasswordRequestUtil;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/reset")
public class PasswordResetTokenController {

    @Autowired
    private UserManagementService userManagementService;
    
    @Autowired
    private RegistrationCompleteEventListener eventListener;

    @PostMapping("/password-reset-request")
    public ResponseEntity<Map<String, String>> resetPasswordRequest(@RequestBody PasswordRequestUtil passwordRequestUtil, HttpServletRequest servletRequest) throws MessagingException, UnsupportedEncodingException {
        Optional<Users> user = userManagementService.findUserByEmail(passwordRequestUtil.getEmail());
        Map<String, String> response = new HashMap<>();

        if (user.isEmpty()) {
            response.put("message", "No user found with the provided email.");
            return ResponseEntity.ok(response);
        }

        String passwordResetToken = userManagementService.createUniquePasswordResetToken(user.get());
        String passwordResetUrl = passwordResetEmailLink(user.get(), getApplicationUrl(servletRequest), passwordResetToken);

        response.put("token", passwordResetToken);
        response.put("url", passwordResetUrl);
        return ResponseEntity.ok(response);
    }

    private String passwordResetEmailLink(Users user, String applicationUrl, String passwordToken) throws MessagingException, UnsupportedEncodingException {
        String url = applicationUrl + "/reset/reset-password?token=" + passwordToken;
        eventListener.sendPasswordResetVerificationEmail(user, url);
        return url;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody PasswordRequestUtil passwordRequestUtil, @RequestParam("token") String token) {
        String tokenVerificationResult = userManagementService.validatePasswordResetToken(token);
        Map<String, String> response = new HashMap<>();

        if (!tokenVerificationResult.equalsIgnoreCase("valid")) {
            response.put("message", "Invalid password reset token.");
            return ResponseEntity.ok(response);
        }

        Optional<Users> theUser = Optional.ofNullable(userManagementService.findUserByPasswordToken(token));
        if (theUser.isPresent()) {
            userManagementService.resetChangePassword(theUser.get(), passwordRequestUtil.getNewPassword());
            response.put("message", "Password has been reset successfully.");
            return ResponseEntity.ok(response);
        }

        response.put("message", "Invalid password reset token.");
        return ResponseEntity.ok(response);
    }


    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody PasswordRequestUtil request) {
        Optional<Users> user = userManagementService.findUserByEmail(request.getEmail());
        if (user.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        boolean isPasswordChanged = userManagementService.changePassword(user.get(), request.getOldPassword(), request.getNewPassword());
        if (!isPasswordChanged) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Incorrect old password.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully.");
        return ResponseEntity.ok(response);
    }


    private String getApplicationUrl(HttpServletRequest request) {
        return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
    }
    
    
    
    
    
    
  
}
