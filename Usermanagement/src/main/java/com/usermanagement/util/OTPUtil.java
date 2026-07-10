package com.usermanagement.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OTPUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateOtp() {
        int otp = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", otp);
    }
}
