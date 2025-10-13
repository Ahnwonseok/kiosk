package com.kiosk.controller;

import com.kiosk.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class UploadController {

    private final S3Service s3Service;

    // POST /api/uploads: multipart/form-data 로 파일을 S3에 업로드
    @PostMapping(value = "/api/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        Map<String, Object> body = new HashMap<>();
        try {
            // S3에 파일 업로드 및 URL 반환
            String s3Url = s3Service.uploadFile(file);
            
            // 파일명 추출 (URL에서 마지막 부분)
            String fileName = s3Url.substring(s3Url.lastIndexOf('/') + 1);

            body.put("success", true);
            body.put("fileName", fileName);
            body.put("path", s3Url);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }
}