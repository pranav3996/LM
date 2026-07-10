package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping("/adminuser/get-profile")
    public ResponseEntity<ReqRes> getMyProfile(Authentication authentication) {
        ReqRes response = userManagementService.getMyInfo(authentication.getName());
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
