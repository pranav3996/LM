package com.usermanagement.dto;


import com.usermanagement.entity.Users;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;


@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReqRes {

    private int statusCode;
    private String error;
    private String message;
    private String accessToken;
    private String refreshToken;
    private String expirationAccessTokenTime;
    private String expirationRefreshTokenTime;
    private String firstName;
    private String lastName;
    private String city;
    private String role;
    private String email;
    private String password;
    private Users users;
    private List<Users> usersList;
    private boolean isAdmin;
    
    public boolean isAdmin() {
		return isAdmin;
	}
	public void setAdmin(boolean isAdmin) {
		this.isAdmin = isAdmin;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	
	public int getStatusCode() {
		return statusCode;
	}
	public String getExpirationRefreshTokenTime() {
		return expirationRefreshTokenTime;
	}
	public void setExpirationRefreshTokenTime(String expirationRefreshTokenTime) {
		this.expirationRefreshTokenTime = expirationRefreshTokenTime;
	}
	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}
	public String getError() {
		return error;
	}
	public void setError(String error) {
		this.error = error;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getAccessToken() {
		return accessToken;
	}
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	public String getRefreshToken() {
		return refreshToken;
	}
	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}
	public String getExpirationAccessTokenTime() {
		return expirationAccessTokenTime;
	}
	public void setExpirationAccessTokenTime(String expirationAccessTokenTime) {
		this.expirationAccessTokenTime = expirationAccessTokenTime;
	}
	
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Users getUsers() {
		return users;
	}
	public void setUsers(Users users) {
		this.users = users;
	}
	public List<Users> getUsersList() {
		return usersList;
	}
	public void setUsersList(List<Users> usersList) {
		this.usersList = usersList;
	}
	public ReqRes(int statusCode, String error, String message, String accessToken, String refreshToken,
			String expirationAccessTokenTime, String expirationRefreshTokenTime, String firstName, String lastName, String city,
			String role, String email, String password, Users users, List<Users> usersList, boolean isAdmin) {
		super();
		this.statusCode = statusCode;
		this.error = error;
		this.message = message;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.expirationAccessTokenTime = expirationAccessTokenTime;
		this.expirationRefreshTokenTime = expirationRefreshTokenTime;
		this.firstName = firstName;
		this.lastName = lastName;
		this.city = city;
		this.role = role;
		this.email = email;
		this.password = password;
		this.users = users;
		this.usersList = usersList;
		this.isAdmin = isAdmin;
	}
	public ReqRes() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "ReqRes [statusCode=" + statusCode + ", error=" + error + ", message=" + message + ", accessToken=" + accessToken
				+ ", refreshToken=" + refreshToken + ", expirationAccessTokenTime=" + expirationAccessTokenTime
				+ ", expirationRefreshTokenTime=" + expirationRefreshTokenTime + ", firstName=" + firstName
				+ ", lastName=" + lastName + ", city=" + city + ", role=" + role + ", email=" + email + ", password="
				+ password + ", users=" + users + ", usersList=" + usersList + ", isAdmin=" + isAdmin + "]";
	}

    

}