package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.entity.Users;
import com.usermanagement.service.UploadFileService;
import com.usermanagement.service.UserManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final UserManagementService userManagementService;
    private final UploadFileService uploadFileService;

    public AdminController(UserManagementService userManagementService, UploadFileService uploadFileService) {
        this.userManagementService = userManagementService;
        this.uploadFileService = uploadFileService;
    }

    @PostMapping("/register")
    public ResponseEntity<ReqRes> register(@RequestBody ReqRes registrationRequest) {
        return ResponseEntity.ok(userManagementService.registerAdmin(registrationRequest));
    }

    @GetMapping("/get-all-users")
    public ResponseEntity<ReqRes> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    @GetMapping("/get-users/{userId}")
    public ResponseEntity<ReqRes> getUserById(@PathVariable Integer userId) {
        return ResponseEntity.ok(userManagementService.getUsersById(userId));
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<ReqRes> updateUser(@PathVariable Integer userId, @RequestBody Users reqres) {
        return ResponseEntity.ok(userManagementService.updateUser(userId, reqres));
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<ReqRes> deleteUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(userManagementService.deleteUser(userId));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadExcel(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> response = uploadFileService.saveUsersExcelToDatabase(file);
            if ("error".equals(response.get("status"))) {
                HttpStatus status = switch (response.getOrDefault("statusCode", "500")) {
                    case "409" -> HttpStatus.CONFLICT;
                    case "422" -> HttpStatus.UNPROCESSABLE_ENTITY;
                    case "400" -> HttpStatus.BAD_REQUEST;
                    default -> HttpStatus.INTERNAL_SERVER_ERROR;
                };
                return ResponseEntity.status(status).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", "statusCode", "400",
                    "message", "Column missing or exceeds expected count.",
                    "details", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error during file upload: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "An unexpected error occurred.",
                    "details", ex.getMessage()));
        }
    }
}
