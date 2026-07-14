package com.usermanagement.service;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.entity.Users;
import com.usermanagement.entity.VerificationToken;
import com.usermanagement.event.RegistrationCompleteEvent;
import com.usermanagement.jwt.JWTUtils;
import com.usermanagement.repo.OTPRepo;
import com.usermanagement.repo.PasswordResetTokenRepository;
import com.usermanagement.repo.UsersRepo;
import com.usermanagement.repo.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserManagementService {

    private static final Logger log = LoggerFactory.getLogger(UserManagementService.class);

    private final UsersRepo usersRepo;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final OTPRepo otpRepo;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final PasswordResetTokenService passwordResetTokenService;

    public UserManagementService(UsersRepo usersRepo,
                                 PasswordResetTokenRepository passwordResetTokenRepository,
                                 VerificationTokenRepository verificationTokenRepository,
                                 OTPRepo otpRepo,
                                 JWTUtils jwtUtils,
                                 AuthenticationManager authenticationManager,
                                 PasswordEncoder passwordEncoder,
                                 ApplicationEventPublisher eventPublisher,
                                 PasswordResetTokenService passwordResetTokenService) {
        this.usersRepo = usersRepo;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.otpRepo = otpRepo;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
        this.passwordResetTokenService = passwordResetTokenService;
    }

    public ReqRes login(ReqRes loginRequest) {
        ReqRes response = new ReqRes();
        Optional<Users> optionalUser = usersRepo.findByEmail(loginRequest.getEmail());

        if (optionalUser.isEmpty()) {
            response.setStatusCode(404);
            response.setMessage("User not found");
            return response;
        }

        Users user = optionalUser.get();
        if (!user.isEnabled()) {
            response.setStatusCode(403);
            response.setMessage("User is not verified. Please check your email for a verification link.");
            return response;
        }

        // Let AuthenticationException propagate — caught by GlobalExceptionHandler
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

        response.setStatusCode(200);
        response.setEmail(userDetails.getUsername());
        response.setRole(user.getRole());
        response.setAccessToken(jwtToken);
        response.setExpirationAccessTokenTime(jwtUtils.extractExpiration(jwtToken).toString());
        response.setRefreshToken(refreshToken);
        response.setExpirationRefreshTokenTime(jwtUtils.extractExpiration(refreshToken).toString());
        response.setAdmin("ADMIN".equalsIgnoreCase(user.getRole()));
        response.setMessage("Successfully Logged In");
        return response;
    }

    public ReqRes refreshToken(ReqRes refreshTokenRequest) {
        ReqRes response = new ReqRes();

        if (refreshTokenRequest.getRefreshToken() == null || refreshTokenRequest.getRefreshToken().isBlank()) {
            response.setStatusCode(400);
            response.setMessage("Refresh token is required.");
            return response;
        }

        String email = jwtUtils.extractUsername(refreshTokenRequest.getRefreshToken());
        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (!jwtUtils.isTokenValid(refreshTokenRequest.getRefreshToken(), user)) {
            response.setStatusCode(403);
            response.setMessage("Invalid or expired refresh token");
            return response;
        }

        String newJwtToken = jwtUtils.generateToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

        response.setStatusCode(200);
        response.setAccessToken(newJwtToken);
        response.setExpirationAccessTokenTime(jwtUtils.extractExpiration(newJwtToken).toString());
        response.setRefreshToken(newRefreshToken);
        response.setExpirationRefreshTokenTime(jwtUtils.extractExpiration(newRefreshToken).toString());
        response.setAdmin("ADMIN".equalsIgnoreCase(user.getRole()));
        response.setMessage("Successfully Refreshed Token");
        return response;
    }

    @Transactional
    public ReqRes registerUser(ReqRes registrationRequest, String applicationUrl) {
        if (usersRepo.findByEmail(registrationRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists. Please try with a different email.");
        }
        ReqRes resp = new ReqRes();
        Users user = new Users();
        user.setEmail(registrationRequest.getEmail());
        user.setCity(registrationRequest.getCity());
        user.setRole("USER");
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        Users savedUser = usersRepo.save(user);
        resp.setUsers(savedUser);
        resp.setMessage("User Saved Successfully");
        resp.setStatusCode(200);
        eventPublisher.publishEvent(new RegistrationCompleteEvent(savedUser, applicationUrl));
        return resp;
    }

    @Transactional
    public ReqRes registerAdmin(ReqRes registrationRequest) {
        Users user = new Users();
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setCity(registrationRequest.getCity());
        user.setRole(registrationRequest.getRole());
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setEnabled(true);
        Users savedUser = usersRepo.save(user);

        ReqRes response = new ReqRes();
        response.setEmail(savedUser.getEmail());
        response.setUsers(savedUser);
        response.setMessage("Admin registered successfully.");
        response.setStatusCode(200);
        return response;
    }

    public ReqRes getAllUsers() {
        ReqRes reqRes = new ReqRes();
        List<Users> result = usersRepo.findAll();
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
    }

    @Transactional
    public ReqRes deleteUser(Integer userId) {
        ReqRes reqRes = new ReqRes();
        Optional<Users> userOptional = usersRepo.findById(userId);
        if (userOptional.isEmpty()) {
            reqRes.setStatusCode(404);
            reqRes.setMessage("User not found for deletion");
            return reqRes;
        }
        verificationTokenRepository.deleteByUserId(userId);
        passwordResetTokenRepository.deleteByUserId(userId);
        otpRepo.deleteByUserId(userId);
        usersRepo.deleteById(userId);
        log.info("Deleted user with id: {}", userId);
        reqRes.setStatusCode(200);
        reqRes.setAdmin("ADMIN".equalsIgnoreCase(userOptional.get().getRole()));
        reqRes.setMessage("User deleted successfully");
        return reqRes;
    }

    @Transactional
    public ReqRes updateUser(Integer userId, Users updatedUser) {
        ReqRes reqRes = new ReqRes();
        Optional<Users> userOptional = usersRepo.findById(userId);
        if (userOptional.isEmpty()) {
            reqRes.setStatusCode(404);
            reqRes.setMessage("User not found for update");
            return reqRes;
        }
        Users existingUser = userOptional.get();
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setCity(updatedUser.getCity());
        existingUser.setRole(updatedUser.getRole());

        if (!existingUser.isEnabled()) {
            existingUser.setEnabled(updatedUser.isEnabled());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        Users savedUser = usersRepo.save(existingUser);
        reqRes.setUsers(savedUser);
        reqRes.setAdmin("ADMIN".equalsIgnoreCase(savedUser.getRole()));
        reqRes.setStatusCode(200);
        reqRes.setMessage("User updated successfully");
        return reqRes;
    }

    public ReqRes getMyInfo(String email) {
        ReqRes reqRes = new ReqRes();
        Optional<Users> userOptional = usersRepo.findByEmail(email);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            reqRes.setUsers(user);
            reqRes.setAdmin("ADMIN".equalsIgnoreCase(user.getRole()));
            reqRes.setStatusCode(200);
            reqRes.setMessage("Successful");
        } else {
            reqRes.setStatusCode(404);
            reqRes.setMessage("User not found");
        }
        return reqRes;
    }

    public ReqRes getUsersById(Integer id) {
        ReqRes reqRes = new ReqRes();
        Users user = usersRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        reqRes.setUsers(user);
        reqRes.setAdmin("ADMIN".equalsIgnoreCase(user.getRole()));
        reqRes.setStatusCode(200);
        reqRes.setMessage("User with id '" + id + "' found successfully");
        return reqRes;
    }

    public Optional<Users> findUserByEmail(String email) {
        return usersRepo.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return usersRepo.existsByEmail(email);
    }

    @Transactional
    public void saveUserVerificationToken(Users theUser, String token) {
        verificationTokenRepository.save(new VerificationToken(token, theUser));
    }

    @Transactional
    public String validateToken(String theToken) {
        VerificationToken token = verificationTokenRepository.findByToken(theToken);
        if (token == null) {
            return "Invalid verification token";
        }
        if (token.isExpired()) {
            // Do NOT delete — keep the record so resend can look it up by this token
            return "Verification link already expired, Please click the link below to receive a new verification link";
        }
        Users user = token.getUser();
        user.setEnabled(true);
        usersRepo.save(user);
        verificationTokenRepository.delete(token);
        return "valid";
    }

    @Transactional
    public VerificationToken generateNewVerificationToken(String oldToken) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(oldToken);
        if (verificationToken == null) {
            throw new IllegalArgumentException("No verification token found. Please register again.");
        }
        verificationToken.setToken(UUID.randomUUID().toString());
        verificationToken.setExpirationTime(verificationToken.getTokenExpirationTime());
        return verificationTokenRepository.save(verificationToken);
    }

    public Users getUserByToken(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);
        return verificationToken != null ? verificationToken.getUser() : null;
    }

    @Transactional
    public void resetChangePassword(Users theUser, String newPassword) {
        theUser.setPassword(passwordEncoder.encode(newPassword));
        usersRepo.save(theUser);
    }

    public boolean oldPasswordIsValid(Users user, String oldPassword) {
        return passwordEncoder.matches(oldPassword, user.getPassword());
    }

    @Transactional
    public boolean changePassword(Users user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepo.save(user);
        return true;
    }

    public String validatePasswordResetToken(String token) {
        return passwordResetTokenService.validatePasswordResetToken(token);
    }

    public Users findUserByPasswordToken(String token) {
        return passwordResetTokenService.findUserByPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("No user found for password reset token"));
    }

    public void createPasswordResetTokenForUser(Users user, String passwordResetToken) {
        passwordResetTokenService.createPasswordResetTokenForUser(user, passwordResetToken);
    }

    @Transactional
    public String createUniquePasswordResetToken(Users user) {
        String token = UUID.randomUUID().toString();
        createPasswordResetTokenForUser(user, token);
        return token;
    }
}
