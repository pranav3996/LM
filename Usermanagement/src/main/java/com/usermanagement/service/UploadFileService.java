package com.usermanagement.service;

import java.io.IOException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.ss.usermodel.Cell;

import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.usermanagement.entity.Users;

import com.usermanagement.repo.UsersRepo;

@Service
public class UploadFileService {

	@Autowired
	private UsersRepo usersRepo;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public Map<String, String> saveUsersExcelToDatabase(MultipartFile file)
			throws EncryptedDocumentException, IOException {
		List<List<String>> rows = new ArrayList<>();
		String defaultPassword = "123456";
		Map<String, String> response = new HashMap<>();
		int expectedColumnCount = 8;

		// Validate file extension
		String filename = file.getOriginalFilename();
		if (filename == null || !(filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
			response.put("status", "error");
			response.put("statusCode", "400");
			response.put("message", "Invalid file format. Only Excel files are allowed.");
			return response;
		}

		try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
			Sheet sheet = workbook.getSheetAt(0);
			rows = StreamSupport.stream(sheet.spliterator(), false).skip(1) // Skip header row
					.map(row -> StreamSupport.stream(row.spliterator(), false).map(this::getCellStringValue)
							.filter(cellValue -> !cellValue.isEmpty()) // Filter out empty cells
							.collect(Collectors.toList()))
					.filter(rowList -> !rowList.isEmpty()) // Filter out empty rows
					.collect(Collectors.toList());
		}

		System.out.println("rows :: " + rows);

		List<Users> userList = rows.stream().map(row -> {

			if (row.size() != expectedColumnCount) {
				throw new IllegalArgumentException("Column count mismatch. Expected: " + expectedColumnCount
						+ ", Found: " + row.size() + " in row: " + row);
			}

			Users user = new Users();

			user.setId((int) Double.parseDouble(row.get(0)));
			user.setFirstName(row.get(2));
			user.setLastName(row.get(3));
			user.setEmail(row.get(4));
			user.setRole(row.get(5));
			user.setCity(row.get(6));
			user.setPassword(passwordEncoder.encode(defaultPassword));

			// Handle isEnabled using a switch case
			switch (row.get(7).toLowerCase()) {
			case "true":
			case "yes":
			case "1":
				user.setEnabled(true);
				break;
			case "false":
			case "no":
			case "0":
				user.setEnabled(false);
				break;
			default:
				System.err.println("Invalid isEnabled value: " + row.get(7));
				user.setEnabled(false);
				break;
			}

			return user;

		}).collect(Collectors.toList());

		try {

			usersRepo.saveAll(userList);

			response.put("status", "success");
			response.put("statusCode", "200");
			response.put("message", "All users saved successfully.");
		} catch (DataIntegrityViolationException ex) {
			response.put("status", "error");
			response.put("statusCode", "409");
			response.put("message", "Duplicate entry found.");
			response.put("details", ex.getMessage());
			System.err.println("Error occurred while processing database : " + response);
		} catch (EncryptedDocumentException ex) {
			response.put("status", "error");
			response.put("statusCode", "422");
			response.put("message", "Excel Processing Error");
			response.put("details", ex.getMessage());
			// Handle Excel-related exceptions
			System.err.println("Error occurred while processing Excel file: " + response);
		} catch (Exception ex) {
			response.put("status", "error");
			response.put("statusCode", "500");
			response.put("message", "An unexpected error occurred.");
			response.put("details", ex.getMessage());
		}

		return response;
	}

	private String getCellStringValue(Cell cell) {
		if (cell == null) {
			return "";
		}

		switch (cell.getCellType()) {
		case STRING:
			return cell.getStringCellValue();
		case NUMERIC:
			if (DateUtil.isCellDateFormatted(cell)) {
				LocalDateTime date = cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault())
						.toLocalDateTime();
				return date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
			} else {
				// Handle numeric values and convert to string, trimming unnecessary decimals
				double numericValue = cell.getNumericCellValue();
				if (numericValue == (int) numericValue) {
					return String.valueOf((int) numericValue);
				} else {
					return String.valueOf(numericValue);
				}
			}
		case BOOLEAN:
			return cell.getBooleanCellValue() ? "true" : "false";
		case BLANK:
			return "";
		case ERROR:
			return "Error: " + cell.getErrorCellValue();
		default:
			return "";
		}
	}

}
