package com.usermanagement.controller;

import com.usermanagement.config.AppProperties;
import com.usermanagement.dto.ReqRes;
import com.usermanagement.service.UserManagementService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    static final String REFRESH_COOKIE_PATH  = "/auth/refresh";
    static final String LOGOUT_COOKIE_PATH   = "/auth/logout";

    private final UserManagementService userManagementService;
    private final AppProperties appProperties;

    public AuthenticationController(UserManagementService userManagementService,
                                    AppProperties appProperties) {
        this.userManagementService = userManagementService;
        this.appProperties = appProperties;
    }

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req, HttpServletResponse response) {
        ReqRes result = userManagementService.login(req);
        if (result.getStatusCode() == 200) {
            writeRefreshTokenCookie(response, result.getRefreshToken(),
                    refreshMaxAgeSeconds(), REFRESH_COOKIE_PATH);
            result.setRefreshToken(null);          // strip from JSON body
            result.setExpirationRefreshTokenTime(null);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = extractRefreshTokenCookie(request);
        ReqRes result = userManagementService.refreshToken(rawToken);
        if (result.getStatusCode() == 200) {
            writeRefreshTokenCookie(response, result.getRefreshToken(),
                    refreshMaxAgeSeconds(), REFRESH_COOKIE_PATH);
            result.setRefreshToken(null);          // strip from JSON body
            result.setExpirationRefreshTokenTime(null);
        }
        return ResponseEntity.status(result.getStatusCode()).body(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // Overwrite the cookie with an empty value and Max-Age=0 to instruct the browser to delete it.
        // Both paths that could hold the cookie are cleared.
        writeRefreshTokenCookie(response, "", 0, REFRESH_COOKIE_PATH);
        writeRefreshTokenCookie(response, "", 0, LOGOUT_COOKIE_PATH);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Writes the refresh token as an HttpOnly cookie.
     * Jakarta Servlet's Cookie API has no setSameSite(), so the Set-Cookie header
     * is written manually to include SameSite=Strict.
     */
    private void writeRefreshTokenCookie(HttpServletResponse response,
                                         String value, int maxAge, String path) {
        boolean secure = appProperties.getJwt().isCookieSecure();
        String header = REFRESH_TOKEN_COOKIE + "=" + value
                + "; Path=" + path
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=" + maxAge
                + (secure ? "; Secure" : "");
        response.addHeader("Set-Cookie", header);
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies)
                .filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private int refreshMaxAgeSeconds() {
        return (int) (appProperties.getJwt().getRefreshExpirationMs() / 1000);
    }
}
