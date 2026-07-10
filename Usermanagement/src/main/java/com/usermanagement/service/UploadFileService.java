package com.usermanagement.service;

import com.usermanagement.entity.Users;
import com.usermanagement.repo.UsersRepo;
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class UploadFileService {

    private static final Logger log = LoggerFactory.getLogger(UploadFileService.class);
    private static final int EXPECTED_COLUMN_COUNT = 8;
    private static final String DEFAULT_PASSWORD = "ChangeMe@123";

    private final UsersRepo usersRepo;
    private final PasswordEncoder passwordEncoder;

    public UploadFileService(UsersRepo usersRepo, PasswordEncoder passwordEncoder) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, String> saveUsersExcelToDatabase(MultipartFile file)
            throws EncryptedDocumentException, IOException {

        String filename = file.getOriginalFilename();
        if (filename == null || !(filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            return Map.of("status", "error", "statusCode", "400",
                    "message", "Invalid file format. Only Excel files are allowed.");
        }

        List<List<String>> rows;
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            rows = StreamSupport.stream(sheet.spliterator(), false)
                    .skip(1)
                    .map(row -> StreamSupport.stream(row.spliterator(), false)
                            .map(this::getCellStringValue)
                            .filter(v -> !v.isEmpty())
                            .collect(Collectors.toList()))
                    .filter(r -> !r.isEmpty())
                    .collect(Collectors.toList());
        }

        List<Users> userList = rows.stream().map(row -> {
            if (row.size() != EXPECTED_COLUMN_COUNT) {
                throw new IllegalArgumentException("Column count mismatch. Expected: " + EXPECTED_COLUMN_COUNT
                        + ", Found: " + row.size() + " in row: " + row);
            }
            Users user = new Users();
            user.setId((int) Double.parseDouble(row.get(0)));
            user.setFirstName(row.get(2));
            user.setLastName(row.get(3));
            user.setEmail(row.get(4));
            user.setRole(row.get(5));
            user.setCity(row.get(6));
            user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            user.setEnabled(parseEnabled(row.get(7)));
            return user;
        }).collect(Collectors.toList());

        try {
            usersRepo.saveAll(userList);
            return Map.of("status", "success", "statusCode", "200",
                    "message", "All users saved successfully.");
        } catch (DataIntegrityViolationException ex) {
            log.error("Duplicate entry during Excel import: {}", ex.getMessage());
            return Map.of("status", "error", "statusCode", "409",
                    "message", "Duplicate entry found.", "details", ex.getMessage());
        } catch (EncryptedDocumentException ex) {
            log.error("Excel processing error: {}", ex.getMessage());
            return Map.of("status", "error", "statusCode", "422",
                    "message", "Excel Processing Error", "details", ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error during Excel import: {}", ex.getMessage());
            return Map.of("status", "error", "statusCode", "500",
                    "message", "An unexpected error occurred.", "details", ex.getMessage());
        }
    }

    private boolean parseEnabled(String value) {
        return switch (value.toLowerCase()) {
            case "true", "yes", "1" -> true;
            default -> false;
        };
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    LocalDateTime date = cell.getDateCellValue().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDateTime();
                    yield date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
                }
                double v = cell.getNumericCellValue();
                yield v == (int) v ? String.valueOf((int) v) : String.valueOf(v);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
