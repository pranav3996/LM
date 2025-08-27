package com.usermanagement.util;

import java.util.Random;

import org.springframework.stereotype.Component;

@Component
public class OTPUtil {
	public String generateOtp() {
		Random random = new Random();
		int randomNumber = random.nextInt(999999);// for 6 digit otp

		String output = Integer.toString(randomNumber);

		while (output.length() < 6) {
			output = "0" + output;
		}
		return output;
	}
}
