package com.usermanagement.controller;

import com.usermanagement.dto.ReqRes;
import com.usermanagement.entity.Users;
import com.usermanagement.service.UploadFileService;
import com.usermanagement.service.UserManagementService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin") // comment this line while adding 1st admin record
public class AdminController {

	@Autowired
	private UserManagementService userManagementService;

	@Autowired
	private UploadFileService uploadFileService;

	@PostMapping("/register")
	public ReqRes register(@RequestBody ReqRes registrationRequest) {

		if (registrationRequest.getEmail() == null || registrationRequest.getPassword() == null) {
			throw new RuntimeException("Email and password are required");
		}
		return userManagementService.registerAdmin(registrationRequest);
	}

	@GetMapping("/get-all-users")
	public ResponseEntity<ReqRes> getAllUsers() {
		System.out.println("/admin/get-all-users"); // Log to verify endpoint access

		try {
			ReqRes response = userManagementService.getAllUsers();
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			System.err.println("Error fetching all users: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReqRes());
		}
	}

	@GetMapping("/get-users/{userId}")
	public ResponseEntity<ReqRes> getUserById(@PathVariable Integer userId) {
//        return ResponseEntity.ok(userManagementService.getUsersById(userId));
		ReqRes response = userManagementService.getUsersById(userId);
		if (response == null) {
			throw new RuntimeException("User with ID " + userId + " not found");
		}
		return ResponseEntity.ok(response);
	}

	@PutMapping("/update/{userId}")
	public ResponseEntity<ReqRes> updateUser(@PathVariable Integer userId, @RequestBody Users reqres) {
//        return ResponseEntity.ok(userManagementService.updateUser(userId, reqres));
		ReqRes response = userManagementService.updateUser(userId, reqres);
		if (response == null) {
			throw new RuntimeException("User with ID " + userId + " not found");
		}
		return ResponseEntity.ok(response);
	}


	@DeleteMapping("/delete/{userId}")
	public ResponseEntity<ReqRes> deleteUser(@PathVariable Integer userId) {
//        return ResponseEntity.ok(userManagementService.deleteUser(userId));
		ReqRes response = userManagementService.deleteUser(userId);
		if (response == null) {
			throw new RuntimeException("User with ID " + userId + " not found");
		}
		return ResponseEntity.ok(response);
	}

	@PostMapping("/upload")
	public ResponseEntity<Map<String, String>> uploadExcel(@RequestParam("file") MultipartFile file) {
		try {
			Map<String, String> response = uploadFileService.saveUsersExcelToDatabase(file);

			// Check for specific statuses in the response
			if ("error".equals(response.get("status"))) {
				String errorCode = response.get("statusCode");
				switch (errorCode) {
				case "409":
					return new ResponseEntity<>(response, HttpStatus.CONFLICT);
				case "422":
					return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
				case "400":
					return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
				case "450":
					return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
				default:
					return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
				}
			}

			return new ResponseEntity<>(response, HttpStatus.OK);

		} catch (IllegalArgumentException ex) {
			// Handle specific validation errors that should result in a 400 Bad Request
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("status", "error");
			errorResponse.put("statusCode", "400");
			errorResponse.put("message", "Column Missing or Exceed .");
			errorResponse.put("details", ex.getMessage());
			return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
		} catch (Exception ex) {
			Map<String, String> errorResponse = new HashMap<>();
			errorResponse.put("status", "error");
			errorResponse.put("message", "An unexpected error occurred.");
			errorResponse.put("details", ex.getMessage());
			return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
