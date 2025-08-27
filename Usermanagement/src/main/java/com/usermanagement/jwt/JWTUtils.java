package com.usermanagement.jwt;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

@Component
public class JWTUtils {
	private static final Logger logger = LoggerFactory.getLogger(JWTUtils.class);

	@Value("${spring.app.jwtSecret}")
	private String jwtSecret;

	@Value("${spring.app.jwtExpirationMs}")
	private int jwtExpirationMs;
	
	private long refreshExpirationMs = 120000;

	public String getJwtFromHeader(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		logger.debug("Authorization Header: {}", bearerToken);
		if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7); // Remove Bearer prefix
		}
		return null;
	}

	public String generateToken(UserDetails userDetails) {
		String username = userDetails.getUsername();
		return Jwts.builder().subject(username).issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date((new Date((System.currentTimeMillis()))).getTime() + jwtExpirationMs)).signWith(key()).compact();
	}
 
	public String generateRefreshToken(HashMap<String, Object> claims, UserDetails userDetails) {
		return Jwts.builder().claims(claims).subject(userDetails.getUsername())
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + refreshExpirationMs)).signWith(key()).compact();
	}

	public String getUserNameFromJwtToken(String token) {
		return Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token).getPayload().getSubject();
	}

	private SecretKey key() {
		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
	}

	public boolean validateJwtToken(String authToken) {
		try {
			System.out.println("Validate");
			Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
			return true;
		} catch (MalformedJwtException e) {
			logger.error("Invalid JWT token: {}", e.getMessage());
		} catch (ExpiredJwtException e) {
			logger.error("JWT token is expired: {}", e.getMessage());
		} catch (UnsupportedJwtException e) {
			logger.error("JWT token is unsupported: {}", e.getMessage());
		} catch (IllegalArgumentException e) {
			logger.error("JWT claims string is empty: {}", e.getMessage());
		}
		return false;
	}

	public String extractUsername(String token) {
		return extractClaims(token, Claims::getSubject);
	}

	private <T> T extractClaims(String token, Function<Claims, T> claimsTFunction) {
		return claimsTFunction.apply(Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload());
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}

	public boolean isTokenExpired(String token) {
		return extractClaims(token, Claims::getExpiration).before(new Date());
	}

	public Date extractExpiration(String token) {
		return extractClaims(token, Claims::getExpiration);
	}


}