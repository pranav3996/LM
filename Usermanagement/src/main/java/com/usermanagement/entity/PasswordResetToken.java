package com.usermanagement.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "password_reset_token", indexes = {
        @Index(name = "idx_prt_token", columnList = "token")
})
public class PasswordResetToken {

    private static final int EXPIRATION_MINUTES = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expirationTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    public PasswordResetToken() {}

    public PasswordResetToken(String token, Users user) {
        this.token = token;
        this.user = user;
        this.expirationTime = Instant.now().plusSeconds(EXPIRATION_MINUTES * 60L);
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expirationTime);
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getExpirationTime() { return expirationTime; }
    public void setExpirationTime(Instant expirationTime) { this.expirationTime = expirationTime; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
}
