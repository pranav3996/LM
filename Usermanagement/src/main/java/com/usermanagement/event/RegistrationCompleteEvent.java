package com.usermanagement.event;

import org.springframework.context.ApplicationEvent;

import com.usermanagement.entity.Users;

public class RegistrationCompleteEvent extends ApplicationEvent {
	private Users user;
	private String applicationUrl;

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	public String getApplicationUrl() {
		return applicationUrl;
	}

	public void setApplicationUrl(String applicationUrl) {
		this.applicationUrl = applicationUrl;
	}

	public RegistrationCompleteEvent(Users user, String applicationUrl) {
		super(user);
		this.user = user;
		this.applicationUrl = applicationUrl;
	}

}
