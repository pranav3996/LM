package com.usermanagement.service;

import com.usermanagement.entity.OTP;
import com.usermanagement.entity.Users;
import com.usermanagement.event.listener.OTPEmailUtil;
import com.usermanagement.repo.OTPRepo;
import com.usermanagement.util.OTPUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PasswordResetOTPService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetOTPService.class);

    private final OTPRepo otpRepo;
    private final OTPUtil otpUtil;
    private final OTPEmailUtil emailUtil;

    public PasswordResetOTPService(OTPRepo otpRepo, OTPUtil otpUtil, OTPEmailUtil emailUtil) {
        this.otpRepo = otpRepo;
        this.otpUtil = otpUtil;
        this.emailUtil = emailUtil;
    }

    @Transactional
    public String verifyOTP(Users user, String otp) {
        logger.debug("Verifying OTP for user: {}", user.getEmail());
        OTP otpEntity = getOtpByUser(user);
        validateOtp(otpEntity, otp);
        otpEntity.setOtpVerified(true);
        otpRepo.save(otpEntity);
        return otp;
    }

    @Transactional
    public String generateOrRegenerateOtp(Users user, boolean isNewOtp) {
        String email = user.getEmail();
        logger.debug("{} OTP for email: {}", isNewOtp ? "Generating" : "Regenerating", email);

        String otp = otpUtil.generateOtp();
        String subject = isNewOtp ? "OTP Generated" : "OTP Regenerated";
        String body = isNewOtp ? "Your OTP is " + otp : "Your Regenerated OTP is " + otp;
        emailUtil.sendOtpEmail(email, subject, body);

        OTP otpEntity = otpRepo.findByUser(user).orElse(new OTP());
        otpEntity.setUser(user);
        otpEntity.setOtp(otp);
        otpEntity.setOtpGeneratedTime(LocalDateTime.now());
        otpEntity.setOtpVerified(false);
        otpRepo.save(otpEntity);
        return otp;
    }

    public OTP getOtpByUser(Users user) {
        return otpRepo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("OTP not found for user: " + user.getEmail()));
    }

    @Transactional
    public void saveOtp(OTP otpEntity) {
        otpRepo.save(otpEntity);
    }

    private void validateOtp(OTP otpEntity, String otp) {
        if (!otpEntity.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        long otpAgeInSeconds = Duration.between(otpEntity.getOtpGeneratedTime(), LocalDateTime.now()).getSeconds();
        if (otpAgeInSeconds >= 60) {
            throw new RuntimeException("OTP expired, please regenerate");
        }
    }
}
