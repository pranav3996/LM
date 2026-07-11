package com.usermanagement.event.listener;

import com.usermanagement.config.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class OTPEmailUtil {

    private static final Logger log = LoggerFactory.getLogger(OTPEmailUtil.class);

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public OTPEmailUtil(JavaMailSender mailSender, AppProperties appProperties) {
        this.mailSender = mailSender;
        this.appProperties = appProperties;
    }

    public void sendOtpEmail(String to, String subject, String body) {
        try {
            String senderEmail = appProperties.getMail().getSenderEmail();
            String senderName = appProperties.getMail().getSenderName();
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(senderEmail, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }
}
