package com.usermanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.usermanagement.dto.ReqRes;

import com.usermanagement.entity.Users;
import com.usermanagement.entity.VerificationToken;
import com.usermanagement.event.RegistrationCompleteEvent;

import com.usermanagement.jwt.JWTUtils;
import com.usermanagement.repo.OTPRepo;
import com.usermanagement.repo.PasswordResetTokenRepository;
import com.usermanagement.repo.UsersRepo;
import com.usermanagement.repo.VerificationTokenRepository;

import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserManagementService {

	@Autowired
	private UsersRepo usersRepo;
	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;
	@Autowired
	private VerificationTokenRepository verificationTokenRepository;
	@Autowired
	private OTPRepo otpRepo;
	@Autowired
	private JWTUtils jwtUtils;
	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private ApplicationEventPublisher eventPublisher;
	@Autowired
	private PasswordResetTokenService passwordResetTokenService;

	public ReqRes registerUser(ReqRes registrationRequest, String applicationUrl) {
		ReqRes resp = new ReqRes();

		try {
			Users user = new Users();
			user.setEmail(registrationRequest.getEmail());
			user.setCity(registrationRequest.getCity());
//            user.setRole(registrationRequest.getRole());
			user.setRole("USER");
			user.setFirstName(registrationRequest.getFirstName());
			user.setLastName(registrationRequest.getLastName());
			user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
			Users ourUsersResult = usersRepo.save(user);
			if (ourUsersResult.getId() > 0) {
				resp.setUsers(ourUsersResult);
				resp.setMessage("User Saved Successfully");
				resp.setStatusCode(200);
				eventPublisher.publishEvent(new RegistrationCompleteEvent(ourUsersResult, applicationUrl));
			}

		} catch (Exception e) {
			resp.setStatusCode(500);
			resp.setError(e.getMessage());
		}
		return resp;
	}

	public ReqRes registerAdmin(ReqRes registrationRequest) {
		Users user = new Users();
		user.setEmail(registrationRequest.getEmail());
		user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
		user.setCity(registrationRequest.getCity());
		user.setRole(registrationRequest.getRole());
		user.setFirstName(registrationRequest.getFirstName());
		user.setLastName(registrationRequest.getLastName());
		user.setEnabled(true); // Enable the user without email verification
		Users savedUser = usersRepo.save(user);

		ReqRes response = new ReqRes();
		response.setEmail(savedUser.getEmail());
		response.setUsers(savedUser);
		response.setMessage("Admin registered successfully.");
		response.setStatusCode(200);
		return response;
	}

	public ReqRes login(ReqRes loginRequest) {
		Authentication authentication;
		try {
			authentication = ((AuthenticationManager) authenticationManager).authenticate(
					new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

			SecurityContextHolder.getContext().setAuthentication(authentication);

			UserDetails userDetails = (UserDetails) authentication.getPrincipal();

			String jwtToken = jwtUtils.generateToken(userDetails);

			Date accessTokenExpiration = jwtUtils.extractExpiration(jwtToken);

			Optional<Users> optionalUser = usersRepo.findByEmail(userDetails.getUsername());

			// Check if the user exists
			if (optionalUser.isPresent()) {
				Users user = optionalUser.get(); // Extract the Users object from Optional
				var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
				Date refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);
				// Assuming role is a single value, convert it into a List<String>
				List<String> roles = Collections.singletonList(user.getRole());

				ReqRes response = new ReqRes();
				response.setEmail(userDetails.getUsername());
				response.setStatusCode(200);
				response.setRole(String.join(",", roles)); // Convert roles to a comma-separated string if needed
				response.setAccessToken(jwtToken); // Replace jwtToken with your token generation logic
				response.setExpirationAccessTokenTime(accessTokenExpiration.toString());
				response.setRefreshToken(refreshToken);
				response.setExpirationRefreshTokenTime(refreshTokenExpiration.toString());
				response.setAdmin(user.getRole().equalsIgnoreCase("ADMIN"));
				response.setMessage("Successfully Logged In");
			

				return response;
			} else {
				// Handle case where user is not found
				ReqRes response = new ReqRes();
				response.setStatusCode(404);
				response.setMessage("User not found");
				return response;
			}

		} catch (AuthenticationException exception) {
			ReqRes response = new ReqRes();
			response.setStatusCode(500);
			response.setMessage("Bad credentials");
			return response;
		}

	}

	public ReqRes refreshToken(ReqRes refreshTokenRequest) {
		ReqRes response = new ReqRes();

		if (refreshTokenRequest.getRefreshToken() == null || refreshTokenRequest.getRefreshToken().isEmpty()) {
			response.setStatusCode(400);
			response.setMessage("Refresh token is required.");
//			throw new InvalidUserDataException("Refresh token is required.");
			return response;
		}

		try {
			String ourEmail = jwtUtils.extractUsername(refreshTokenRequest.getRefreshToken());
		
			Users users = usersRepo.findByEmail(ourEmail).orElseThrow(() -> new RuntimeException("User Not found with email " + ourEmail));
		
			if (jwtUtils.isTokenValid(refreshTokenRequest.getRefreshToken(), users)) {
				String newJwtToken = jwtUtils.generateToken(users);
				Date newAccessTokenExpiration = jwtUtils.extractExpiration(newJwtToken);

				var newRefreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), users);
				Date newRefreshTokenExpiration = jwtUtils.extractExpiration(newRefreshToken);
				System.out.println("new refreshToken"+newRefreshToken);
				response.setStatusCode(200);
				response.setAccessToken(newJwtToken);
				response.setExpirationAccessTokenTime(newAccessTokenExpiration.toString());
//				response.setRefreshToken(refreshTokenRequest.getRefreshToken());
				response.setRefreshToken(newRefreshToken);
			
				response.setExpirationRefreshTokenTime(newRefreshTokenExpiration.toString());
				response.setAdmin(users.getRole().equalsIgnoreCase("ADMIN"));
				response.setMessage("Successfully Refreshed Token");
				System.out.println("Refresh response"+response);
			} else {
				response.setStatusCode(403);
				response.setMessage("Invalid Refresh Token");
				 throw new RuntimeException("Invalid refresh token.");
			}

			return response;
		} catch (Exception e) {
			response.setStatusCode(500);
			response.setMessage(e.getMessage());
//			throw new TokenRefreshException("An error occurred while refreshing the token: " + e.getMessage());
			return response;
		}
	}


	public ReqRes getAllUsers() {
		ReqRes reqRes = new ReqRes();
		System.out.println("ALL Users" + reqRes);
		try {
			List<Users> result = usersRepo.findAll();
			System.out.println("ALL Users" + result);
			if (!result.isEmpty()) {
				reqRes.setUsersList(result);
				reqRes.setStatusCode(200);
				reqRes.setMessage("Successful");
				reqRes.setAdmin(true);
			} else {
				reqRes.setStatusCode(404);
				reqRes.setMessage("No users found");
			}
			return reqRes;
		} catch (Exception e) {
			reqRes.setStatusCode(500);
			reqRes.setMessage("Error occurred: " + e.getMessage());
			return reqRes;
		}
	}

	public ReqRes getUsersById(Integer id) {
		ReqRes reqRes = new ReqRes();
		try {
			Users usersById = usersRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not found with id " + id));
			reqRes.setUsers(usersById);
			reqRes.setStatusCode(200);
			reqRes.setMessage("Users with id '" + id + "' found successfully");
		} catch (Exception e) {
			reqRes.setStatusCode(500);
			reqRes.setMessage("Error occurred: " + e.getMessage());
		}
		return reqRes;
	}

	public ReqRes deleteUser(Integer userId) {
		ReqRes reqRes = new ReqRes();
		try {
			Optional<Users> userOptional = usersRepo.findById(userId);
			if (userOptional.isPresent()) {
				// Deleting verification tokens
				verificationTokenRepository.deleteByUserId(userId);
				System.out.println("Deleted verification token for userId: " + userId);

				// Deleting password reset tokens
				passwordResetTokenRepository.deleteByUserId(userId);
				System.out.println("Deleted password reset token for userId: " + userId);

				// Deleting OTP
				otpRepo.deleteByUserId(userId);
				System.out.println("Deleted otp for userId: " + userId);

				// Deleting user
				usersRepo.deleteById(userId);
				System.out.println("Deleted user for userId: " + userId);

				reqRes.setStatusCode(200);
				reqRes.setMessage("User deleted successfully");
			} else {
				reqRes.setStatusCode(404);
				reqRes.setMessage("User not found for deletion");
			}
		} catch (Exception e) {
			reqRes.setStatusCode(500);
			reqRes.setMessage("Error occurred while deleting user: " + e.getMessage());
			e.printStackTrace();
		}
		return reqRes;
	}

	public ReqRes updateUser(Integer userId, Users updatedUser) {
		ReqRes reqRes = new ReqRes();
		try {
			Optional<Users> userOptional = usersRepo.findById(userId);
			if (userOptional.isPresent()) {
				Users existingUser = userOptional.get();
				existingUser.setEmail(updatedUser.getEmail());
				existingUser.setFirstName(updatedUser.getFirstName());
				existingUser.setLastName(updatedUser.getLastName());
				existingUser.setCity(updatedUser.getCity());
				existingUser.setRole(updatedUser.getRole());

				// Check if password is present in the request
				if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
					// Encode the password and update it
					existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
				}

				Users savedUser = usersRepo.save(existingUser);
				reqRes.setUsers(savedUser);
				reqRes.setStatusCode(200);
				reqRes.setMessage("User updated successfully");
			} else {
				reqRes.setStatusCode(404);
				reqRes.setMessage("User not found for update");
			}
		} catch (Exception e) {
			reqRes.setStatusCode(500);
			reqRes.setMessage("Error occurred while updating user: " + e.getMessage());
		}
		return reqRes;
	}

	public ReqRes getMyInfo(String email) {
		ReqRes reqRes = new ReqRes();
		try {
			Optional<Users> userOptional = usersRepo.findByEmail(email);
			if (userOptional.isPresent()) {
				reqRes.setUsers(userOptional.get());
				reqRes.setStatusCode(200);
				reqRes.setMessage("successful");
			} else {
				reqRes.setStatusCode(404);
				reqRes.setMessage("User not found for update");
			}

		} catch (Exception e) {
			reqRes.setStatusCode(500);
			reqRes.setMessage("Error occurred while getting user info: " + e.getMessage());
		}
		return reqRes;

	}

	public void saveUserVerificationToken(Users theUser, String token) {
		var verificationToken = new VerificationToken(token, theUser);
		verificationTokenRepository.save(verificationToken);
	}

	public String validateToken(String theToken) {
		VerificationToken token = verificationTokenRepository.findByToken(theToken);
		if (token == null) {
			return "Invalid verification token";
		}
		Users user = token.getUser();
		Calendar calendar = Calendar.getInstance();
		if ((token.getExpirationTime().getTime() - calendar.getTime().getTime()) <= 0) {
			return "Verification link already expired,"
					+ " Please, click the link below to receive a new verification link";
		}
		user.setEnabled(true);
		usersRepo.save(user);
		return "valid";
	}

	public VerificationToken generateNewVerificationToken(String oldToken) {
		VerificationToken verificationToken = verificationTokenRepository.findByToken(oldToken);
		var verificationTokenTime = new VerificationToken();
		verificationToken.setToken(UUID.randomUUID().toString());
		verificationToken.setExpirationTime(verificationTokenTime.getTokenExpirationTime());
		return verificationTokenRepository.save(verificationToken);
	}

	public void resetChangePassword(Users theUser, String newPassword) {
		theUser.setPassword(passwordEncoder.encode(newPassword));
		usersRepo.save(theUser);
	}

	public boolean oldPasswordIsValid(Users user, String oldPassword) {
		return passwordEncoder.matches(oldPassword, user.getPassword());
	}

	public boolean changePassword(Users user, String oldPassword, String newPassword) {
		if (passwordEncoder.matches(oldPassword, user.getPassword())) {
			user.setPassword(passwordEncoder.encode(newPassword));
			usersRepo.save(user);
			return true; // Password successfully changed
		}
		return false; // Old password is incorrect
	}

	public String validatePasswordResetToken(String token) {
		return passwordResetTokenService.validatePasswordResetToken(token);
	}

	public Users findUserByPasswordToken(String token) {
		return passwordResetTokenService.findUserByPasswordToken(token).get();
	}

	public void createPasswordResetTokenForUser(Users user, String passwordResetToken) {
		passwordResetTokenService.createPasswordResetTokenForUser(user, passwordResetToken);
	}

	public Optional<Users> findUserByEmail(String email) {
		return usersRepo.findByEmail(email);
	}

	public String createUniquePasswordResetToken(Users user) {
		String token;
		do {
			token = UUID.randomUUID().toString();
		} while (passwordResetTokenRepository.findByToken(token) != null);

		createPasswordResetTokenForUser(user, token);
		return token;
	}

}