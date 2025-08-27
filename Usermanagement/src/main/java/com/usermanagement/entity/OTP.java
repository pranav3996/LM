package com.usermanagement.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class OTP {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private int id;
	 private String otp;
	 private LocalDateTime otpGeneratedTime;
	 @ManyToOne
	 @JoinColumn(name = "user_id")
	 private Users user;
	 
		private boolean otpVerified;
	 
 public boolean isOtpVerified() {
		return otpVerified;
	}
	public void setOtpVerified(boolean otpVerified) {
		this.otpVerified = otpVerified;
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getOtp() {
		return otp;
	}
	public void setOtp(String otp) {
		this.otp = otp;
	}
	public LocalDateTime getOtpGeneratedTime() {
		return otpGeneratedTime;
	}
	public void setOtpGeneratedTime(LocalDateTime otpGeneratedTime) {
		this.otpGeneratedTime = otpGeneratedTime;
	}
	public Users getUser() {
		return user;
	}
	public void setUser(Users user) {
		this.user = user;
	}
	public OTP(int id, String otp, LocalDateTime otpGeneratedTime, Users user) {
		super();
		this.id = id;
		this.otp = otp;
		this.otpGeneratedTime = otpGeneratedTime;
		this.user = user;
	}
	public OTP() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "OTP [id=" + id + ", otp=" + otp + ", otpGeneratedTime=" + otpGeneratedTime + ", user=" + user + "]";
	}
	 
	 
	 
}
