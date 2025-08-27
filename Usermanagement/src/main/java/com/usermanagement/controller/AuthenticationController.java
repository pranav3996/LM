package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;

import com.usermanagement.service.UserManagementService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private UserManagementService userManagementService;

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req) {
//        return ResponseEntity.ok(userManagementService.login(req));
    	 ReqRes response = userManagementService.login(req);
         if (response == null) {
             throw new RuntimeException("Invalid username or password");
         }
         return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req) {
//        return ResponseEntity.ok(userManagementService.refreshToken(req));
    	  ReqRes response = userManagementService.refreshToken(req);
          if (response == null) {
              throw new RuntimeException("Invalid or expired refresh token");
          }
          return ResponseEntity.ok(response);
    }

    // Other authentication-related endpoints can be added here
}
