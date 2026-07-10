package com.usermanagement.event.listener;

import com.usermanagement.config.AppProperties;
import com.usermanagement.entity.Users;
import com.usermanagement.event.RegistrationCompleteEvent;
import com.usermanagement.service.UserManagementService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.UUID;

@Component
public class RegistrationCompleteEventListener implements ApplicationListener<RegistrationCompleteEvent> {

    private static final Logger log = LoggerFactory.getLogger(RegistrationCompleteEventListener.class);

    private final UserManagementService userService;
    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public RegistrationCompleteEventListener(UserManagementService userService,
                                             JavaMailSender mailSender,
                                             AppProperties appProperties) {
        this.userService = userService;
        this.mailSender = mailSender;
        this.appProperties = appProperties;
    }

    @Override
    public void onApplicationEvent(RegistrationCompleteEvent event) {
        Users user = event.getUser();
        String verificationToken = UUID.randomUUID().toString();
        userService.saveUserVerificationToken(user, verificationToken);
        String url = event.getApplicationUrl() + "/user/verifyEmail?token=" + verificationToken;
        try {
            sendVerificationEmail(user, url);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
        log.info("Verification email sent to: {}", user.getEmail());
    }

    public void sendVerificationEmail(String url) throws MessagingException, UnsupportedEncodingException {
        // This overload is kept for backward compatibility with resend flow in UserRegistrationController.
        // It requires the caller to pass the user separately — see sendVerificationEmail(Users, String).
        throw new UnsupportedOperationException("Use sendVerificationEmail(Users, String) instead");
    }

    public void sendVerificationEmail(Users user, String url)
            throws MessagingException, UnsupportedEncodingException {
        String senderName = appProperties.getMail().getSenderName();
        String mailContent = "<p>Hi, " + user.getFirstName() + ",</p>"
                + "<p>Thank you for registering with us.</p>"
                + "<p>Please follow the link below to complete your registration.</p>"
                + "<a href=\"" + url + "\">Verify your email to activate your account</a>"
                + "<p>Thank you,<br>" + senderName + "</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom(appProperties.getMail().getSenderName());
        helper.setTo(user.getEmail());
        helper.setSubject("Email Verification");
        helper.setText(mailContent, true);
        mailSender.send(message);
    }

    public void sendPasswordResetVerificationEmail(Users user, String url)
            throws MessagingException, UnsupportedEncodingException {
        String senderName = appProperties.getMail().getSenderName();
        String mailContent = "<p>Dear " + user.getFirstName() + ",</p>"
                + "<p>You have requested to reset your password.</p>"
                + "<p>Click the link below to change your password:</p>"
                + "<h3><a href=\"" + url + "\">Change my password</a></h3>"
                + "<p>Ignore this email if you did not make this request.</p>";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        helper.setFrom(senderName);
        helper.setTo(user.getEmail());
        helper.setSubject("Password Reset Request");
        helper.setText(mailContent, true);
        mailSender.send(message);
    }
}
