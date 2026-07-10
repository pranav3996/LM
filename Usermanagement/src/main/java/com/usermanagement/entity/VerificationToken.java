package com.usermanagement.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_token", indexes = {
        @Index(name = "idx_vt_token", columnList = "token")
})
public class VerificationToken {

    private static final int EXPIRATION_MINUTES = 1;

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

    public VerificationToken() {}

    public VerificationToken(String token, Users user) {
        this.token = token;
        this.user = user;
        this.expirationTime = Instant.now().plusSeconds(EXPIRATION_MINUTES * 60L);
    }

    public VerificationToken(Users user) {
        this.user = user;
        this.token = UUID.randomUUID().toString();
        this.expirationTime = Instant.now().plusSeconds(EXPIRATION_MINUTES * 60L);
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expirationTime);
    }

    public Instant getTokenExpirationTime() {
        return Instant.now().plusSeconds(EXPIRATION_MINUTES * 60L);
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
