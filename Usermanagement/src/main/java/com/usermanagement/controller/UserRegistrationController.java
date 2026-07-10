package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.entity.Users;
import com.usermanagement.entity.VerificationToken;
import com.usermanagement.event.listener.RegistrationCompleteEventListener;
import com.usermanagement.service.UserManagementService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserRegistrationController {

    private static final Logger log = LoggerFactory.getLogger(UserRegistrationController.class);

    private final UserManagementService userManagementService;
    private final RegistrationCompleteEventListener eventListener;

    public UserRegistrationController(UserManagementService userManagementService,
                                      RegistrationCompleteEventListener eventListener) {
        this.userManagementService = userManagementService;
        this.eventListener = eventListener;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody ReqRes registrationRequest,
                                                            HttpServletRequest servletRequest) {
        userManagementService.registerUser(registrationRequest, getApplicationUrl(servletRequest));
        return ResponseEntity.ok(Map.of("message",
                "Success! Please check your email to complete your registration."));
    }

    @GetMapping("/verifyEmail")
    public String verifyEmail(@RequestParam("token") String token, HttpServletRequest request) {
        String result = userManagementService.validateToken(token);
        if ("valid".equals(result)) {
            return "Email verified successfully!";
        }
        String url = getApplicationUrl(request) + "/user/resend-verification-token?token=" + token;
        return "Invalid verification link, <a href=\"" + url + "\">Get a new verification link.</a>";
    }

    @GetMapping("/resend-verification-token")
    public String resendVerificationToken(@RequestParam("token") String oldToken,
                                          HttpServletRequest request)
            throws MessagingException, UnsupportedEncodingException {
        VerificationToken verificationToken = userManagementService.generateNewVerificationToken(oldToken);
        Users user = verificationToken.getUser();
        String url = getApplicationUrl(request) + "/user/verifyEmail?token=" + verificationToken.getToken();
        eventListener.sendVerificationEmail(user, url);
        log.info("Resent verification email to: {}", user.getEmail());
        return "A new verification link has been sent to your email. Please check to activate your account.";
    }

    private String getApplicationUrl(HttpServletRequest request) {
        return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
    }
}
