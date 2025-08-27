package com.usermanagement.entity;

import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class VerificationToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	private String token;
	private Date expirationTime;
	private static final int EXPIRATION_TIME = 1;

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

	public VerificationToken(String token, Users user) {
		super();
		this.token = token;
		this.user = user;
		this.expirationTime = this.getTokenExpirationTime();
	}

	public VerificationToken(Users user) {
		this.user = user;
		this.token = UUID.randomUUID().toString();
		this.expirationTime = calculateExpirationDate(EXPIRATION_TIME);
	}

	public VerificationToken(String token) {
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

	public VerificationToken() {
		super();
		// TODO Auto-generated constructor stub
	}

	private Date calculateExpirationDate(int expirationTimeInMinutes) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTimeInMillis(new Date().getTime());
		calendar.add(Calendar.MINUTE, expirationTimeInMinutes);
		return new Date(calendar.getTime().getTime());
	}

}
