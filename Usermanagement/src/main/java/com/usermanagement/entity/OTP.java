package com.usermanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp", indexes = {
        @Index(name = "idx_otp_user_id", columnList = "user_id")
})
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime otpGeneratedTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(nullable = false)
    private boolean otpVerified;

    public OTP() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getOtpGeneratedTime() { return otpGeneratedTime; }
    public void setOtpGeneratedTime(LocalDateTime otpGeneratedTime) { this.otpGeneratedTime = otpGeneratedTime; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public boolean isOtpVerified() { return otpVerified; }
    public void setOtpVerified(boolean otpVerified) { this.otpVerified = otpVerified; }
}
