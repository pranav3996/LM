package com.usermanagement.event.listener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Component
public class OTPEmailUtil {

	@Autowired
	private JavaMailSender mailSender;

	public void sendOtpEmail(String to, String subject, String body) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body);
			mailSender.send(message);
		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}
}
