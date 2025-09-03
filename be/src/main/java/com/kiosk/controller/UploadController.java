package com.kiosk.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.io.InputStream;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import javax.imageio.ImageIO;

@RequiredArgsConstructor
@RestController
public class UploadController {

    // POST /api/uploads: multipart/form-data 로 파일 업로드
    @PostMapping(value = "/api/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file,
                                                      HttpServletRequest request) {
        Map<String, Object> body = new HashMap<>();
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("파일이 비어 있습니다");
            }

            // 프로젝트(BE)와 같은 레벨의 image 디렉토리
            Path baseDir = Paths.get("").toAbsolutePath();
            Path imageDir = baseDir.getParent().resolve("image");
            Files.createDirectories(imageDir);

            // 고유 파일명 생성
            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')) : "";
            String uniqueName = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                    + "-" + UUID.randomUUID() + ext;

            Path target = imageDir.resolve(uniqueName);
            
            // 이미지 리사이징 및 저장
            try (InputStream inputStream = file.getInputStream()) {
                BufferedImage originalImage = ImageIO.read(inputStream);
                if (originalImage != null) {
                    // 이미지 크기 제한 (최대 1920x1080)
                    int maxWidth = 1920;
                    int maxHeight = 1080;
                    
                    int originalWidth = originalImage.getWidth();
                    int originalHeight = originalImage.getHeight();
                    
                    // 비율 유지하면서 크기 조정
                    double scale = Math.min(
                        (double) maxWidth / originalWidth,
                        (double) maxHeight / originalHeight
                    );
                    
                    if (scale < 1.0) {
                        int newWidth = (int) (originalWidth * scale);
                        int newHeight = (int) (originalHeight * scale);
                        
                        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
                        Graphics2D g2d = resizedImage.createGraphics();
                        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
                        g2d.dispose();
                        
                        // 리사이즈된 이미지 저장
                        ImageIO.write(resizedImage, ext.substring(1), target.toFile());
                    } else {
                        // 원본 크기가 제한보다 작으면 그대로 저장
                        file.transferTo(target.toFile());
                    }
                } else {
                    // 이미지가 아닌 경우 원본 파일 저장
                    file.transferTo(target.toFile());
                }
            }

            String scheme = request.getScheme();
            String host = request.getServerName();
            int port = request.getServerPort();
            String url = scheme + "://" + host + ":" + port + "/images/" + uniqueName;

            body.put("success", true);
            body.put("fileName", uniqueName);
            body.put("path", url);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }
}