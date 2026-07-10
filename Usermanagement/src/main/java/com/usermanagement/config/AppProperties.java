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
        private long expirationMs = 1800000;
        private long refreshExpirationMs = 86400000;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getExpirationMs() { return expirationMs; }
        public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
        public long getRefreshExpirationMs() { return refreshExpirationMs; }
        public void setRefreshExpirationMs(long refreshExpirationMs) { this.refreshExpirationMs = refreshExpirationMs; }
    }

    public static class Mail {
        private String senderName = "Login Service";

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
    }

    public static class Cors {
        private String[] allowedOrigins = {"http://localhost:4200"};

        public String[] getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String[] allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }
}
