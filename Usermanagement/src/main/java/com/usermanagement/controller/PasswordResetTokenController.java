package com.usermanagement.controller;

import com.usermanagement.entity.Users;
import com.usermanagement.event.listener.RegistrationCompleteEventListener;
import com.usermanagement.service.UserManagementService;
import com.usermanagement.util.PasswordRequestUtil;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/reset")
public class PasswordResetTokenController {

    private final UserManagementService userManagementService;
    private final RegistrationCompleteEventListener eventListener;

    public PasswordResetTokenController(UserManagementService userManagementService,
                                        RegistrationCompleteEventListener eventListener) {
        this.userManagementService = userManagementService;
        this.eventListener = eventListener;
    }

    @PostMapping("/password-reset-request")
    public ResponseEntity<Map<String, String>> resetPasswordRequest(
            @RequestBody PasswordRequestUtil passwordRequestUtil,
            HttpServletRequest servletRequest) throws MessagingException, UnsupportedEncodingException {
        Optional<Users> user = userManagementService.findUserByEmail(passwordRequestUtil.getEmail());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user found with the provided email."));
        }
        String passwordResetToken = userManagementService.createUniquePasswordResetToken(user.get());
        String url = getApplicationUrl(servletRequest) + "/reset/reset-password?token=" + passwordResetToken;
        eventListener.sendPasswordResetVerificationEmail(user.get(), url);
        return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody PasswordRequestUtil passwordRequestUtil,
                                                             @RequestParam("token") String token) {
        String tokenVerificationResult = userManagementService.validatePasswordResetToken(token);
        if (!"valid".equalsIgnoreCase(tokenVerificationResult)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid password reset token."));
        }
        Optional<Users> theUser = Optional.ofNullable(userManagementService.findUserByPasswordToken(token));
        if (theUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid password reset token."));
        }
        userManagementService.resetChangePassword(theUser.get(), passwordRequestUtil.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody PasswordRequestUtil request) {
        Optional<Users> user = userManagementService.findUserByEmail(request.getEmail());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }
        if (!userManagementService.changePassword(user.get(), request.getOldPassword(), request.getNewPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Incorrect old password."));
        }
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    private String getApplicationUrl(HttpServletRequest request) {
        return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
    }
}
