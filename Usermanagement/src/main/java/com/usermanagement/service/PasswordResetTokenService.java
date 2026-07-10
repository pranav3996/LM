package com.usermanagement.service;

import com.usermanagement.entity.PasswordResetToken;
import com.usermanagement.entity.Users;
import com.usermanagement.repo.PasswordResetTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PasswordResetTokenService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetTokenService.class);

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public PasswordResetTokenService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public void createPasswordResetTokenForUser(Users user, String passwordToken) {
        PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);
        if (existingToken != null) {
            log.debug("Replacing existing password reset token for user: {}", user.getEmail());
            passwordResetTokenRepository.delete(existingToken);
        }
        passwordResetTokenRepository.save(new PasswordResetToken(passwordToken, user));
    }

    public String validatePasswordResetToken(String passwordResetToken) {
        PasswordResetToken passwordToken = passwordResetTokenRepository.findByToken(passwordResetToken);
        if (passwordToken == null) {
            throw new RuntimeException("Invalid verification token");
        }
        if (passwordToken.isExpired()) {
            throw new RuntimeException("Link already expired, please resend link");
        }
        return "valid";
    }

    public Optional<Users> findUserByPasswordToken(String passwordResetToken) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(passwordResetToken);
        return Optional.ofNullable(token != null ? token.getUser() : null);
    }
}
