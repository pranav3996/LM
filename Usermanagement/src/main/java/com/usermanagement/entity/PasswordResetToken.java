package com.usermanagement.entity;

import jakarta.persistence.*;
import java.util.Calendar;
import java.util.Date;
@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String token;
    private Date expirationTime;
    private static final int EXPIRATION_TIME = 5;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public Date getExpirationTime() {
		return expirationTime;
	}

	public void setExpirationTime(Date expirationTime) {
		this.expirationTime = expirationTime;
	}

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	public PasswordResetToken(String token, Users user) {
        super();
        this.token = token;
        this.user = user;
        this.expirationTime = this.getTokenExpirationTime();
    }

    public PasswordResetToken(String token) {
        super();
        this.token = token;
        this.expirationTime = this.getTokenExpirationTime();
    }

    public Date getTokenExpirationTime() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(new Date().getTime());
        calendar.add(Calendar.MINUTE, EXPIRATION_TIME);
        return new Date(calendar.getTime().getTime());
    }

	public PasswordResetToken() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
	    return "PasswordResetToken{" +
	            "id=" + id +
	            ", token='" + token + '\'' +
	            ", expirationTime=" + expirationTime +
	            ", user=" + user +
	            '}';
	}

    
}
