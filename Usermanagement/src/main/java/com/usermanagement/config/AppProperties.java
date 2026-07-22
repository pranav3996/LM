package com.usermanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Mail mail = new Mail();
    private final Cors cors = new Cors();

    public Jwt getJwt() { return jwt; }
    public Mail getMail() { return mail; }
    public Cors getCors() { return cors; }

    public static class Jwt {
        private String secret;
        private long expirationMs = 30000;
        private long refreshExpirationMs = 60000;
        private boolean cookieSecure = false;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getExpirationMs() { return expirationMs; }
        public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
        public long getRefreshExpirationMs() { return refreshExpirationMs; }
        public void setRefreshExpirationMs(long refreshExpirationMs) { this.refreshExpirationMs = refreshExpirationMs; }
        public boolean isCookieSecure() { return cookieSecure; }
        public void setCookieSecure(boolean cookieSecure) { this.cookieSecure = cookieSecure; }
    }

    public static class Mail {
        private String senderName = "Login Service";
        private String senderEmail = "no-reply@example.com";

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    }

    public static class Cors {
        private String[] allowedOrigins = {"http://localhost:4200"};

        public String[] getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String[] allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }
}
