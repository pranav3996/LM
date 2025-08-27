package com.usermanagement.event.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.util.UUID;

import com.usermanagement.entity.Users;
import com.usermanagement.event.RegistrationCompleteEvent;

import com.usermanagement.service.UserManagementService;

@Component
public class RegistrationCompleteEventListener implements ApplicationListener<RegistrationCompleteEvent> {

	private static final Logger log = LoggerFactory.getLogger(RegistrationCompleteEventListener.class);

	@Autowired
	private UserManagementService userService;

	@Autowired
	private JavaMailSender mailSender;

	private Users theUser;

	@Override
	public void onApplicationEvent(RegistrationCompleteEvent event) {
		theUser = event.getUser();
		String verificationToken = UUID.randomUUID().toString();
		userService.saveUserVerificationToken(theUser, verificationToken);
		String url = event.getApplicationUrl() + "/user/verifyEmail?token=" + verificationToken;
		try {
			sendVerificationEmail(url);
			System.out.println("Click the link to verify your registration : {}" + url);
		} catch (MessagingException | UnsupportedEncodingException e) {
			 throw new RuntimeException("Failed to send verification email", e);
		}
		log.info("Click the link to verify your registration : {}", url);
	}

	public void sendVerificationEmail(String url) throws MessagingException, UnsupportedEncodingException {
		String subject = "Email Verification";
		String senderName = "Login";
		String mailContent = "<p> Hi, " + theUser.getFirstName() + ", </p>"
				+ "<p>Thank you for registering with us,</p>"
				+ "<p>Please, follow the link below to complete your registration.</p>" + "<a href=\"" + url
				+ "\">Verify your email to activate your account</a>" + "<p> Thank you <br> Login Service";
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper messageHelper = new MimeMessageHelper(message);
		messageHelper.setFrom("tmail7458@gmail.com", senderName);
		messageHelper.setTo(theUser.getEmail());
		messageHelper.setSubject(subject);
		messageHelper.setText(mailContent, true);
		mailSender.send(message);
	}

	public void sendPasswordResetVerificationEmail(Users user, String url)
			throws MessagingException, UnsupportedEncodingException {
		// Proceed with sending the email
		String subject = "Password Reset Request";
		String senderName = "Your App Name";
		String mailContent = "<p>Dear " + user.getFirstName() + ",</p>";
		mailContent += "<p>You have requested to reset your password.</p>";
		mailContent += "<p>Click the link below to change your password:</p>";
		mailContent += "<h3><a href=\"" + url + "\">Change my password</a></h3>";
		mailContent += "<p>Ignore this email if you remember your password, " + "or you have not made the request.</p>";

		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message);

		helper.setFrom("tmail7458@gmail.com", senderName);
		helper.setTo(user.getEmail());
		helper.setSubject(subject);
		helper.setText(mailContent, true);

		mailSender.send(message);
	}

}
