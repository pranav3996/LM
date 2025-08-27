
package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.entity.Users;
import com.usermanagement.entity.VerificationToken;
import com.usermanagement.event.listener.RegistrationCompleteEventListener;
import com.usermanagement.service.UserManagementService;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserRegistrationController {

	@Autowired
	private UserManagementService userManagementService;

	@Autowired
	private HttpServletRequest servletRequest;
	@Autowired
	private RegistrationCompleteEventListener eventListener;

	@PostMapping("/register")
	public ResponseEntity<Map<String, String>> registerUser(@RequestBody ReqRes registrationRequest) {
		String applicationUrl = getApplicationUrl(servletRequest);
		ReqRes user = userManagementService.registerUser(registrationRequest, applicationUrl);

		Map<String, String> response = new HashMap<>();
		response.put("message", "Success! Please, check your email to complete your registration.");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/verifyEmail")
	public String verifyEmail(@RequestParam("token") String token) {
		String result = userManagementService.validateToken(token);
		String url = getApplicationUrl(servletRequest) + "/user/resend-verification-token?token=" + token;
		if (result.equals("valid")) {
			return "Email verified successfully!";
		} else {
			return "Invalid verification link, <a href=\"" + url + "\">Get a new verification link.</a>";
		}
	}

	@GetMapping("/resend-verification-token")
	public String resendVerificationToken(@RequestParam("token") String oldToken, final HttpServletRequest request)
			throws MessagingException, UnsupportedEncodingException {
		VerificationToken verificationToken = userManagementService.generateNewVerificationToken(oldToken);
		Users theUser = verificationToken.getUser();
		resendRegistrationVerificationTokenEmail(theUser, getApplicationUrl(request), verificationToken);
		return "A new verification link has been sent to your email, please, check to activate your account.";
	}

	private void resendRegistrationVerificationTokenEmail(Users theUser, String applicationUrl,
			VerificationToken verificationToken) throws MessagingException, UnsupportedEncodingException {
		String url = applicationUrl + "/user/verifyEmail?token=" + verificationToken.getToken();
		eventListener.sendVerificationEmail(url);
		System.out.println("Click the link to verify your registration: " + url);
	}

	private String getApplicationUrl(HttpServletRequest request) {
		return "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
	}
}
