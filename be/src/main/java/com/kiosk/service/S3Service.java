package com.kiosk.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.awt.image.BufferedImage;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import javax.imageio.ImageIO;

@Slf4j
@RequiredArgsConstructor
@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * 파일을 S3에 업로드하고 URL을 반환
     * @param file 업로드할 파일
     * @return S3에 저장된 파일의 URL
     */
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다");
        }

        // 고유 파일명 생성
        String original = file.getOriginalFilename();
        String ext = (original != null && original.lastIndexOf('.') != -1)
                ? original.substring(original.lastIndexOf('.')) : "";
        String uniqueName = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + "-" + UUID.randomUUID() + ext;

        // 이미지 리사이징
        byte[] fileBytes = resizeImage(file, ext);
        
        // S3에 업로드
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));

        // S3 URL 반환
        String s3Url = String.format("https://%s.s3.%s.amazonaws.com/%s", 
                bucketName, region, uniqueName);
        
        log.info("파일 업로드 완료: {}", s3Url);
        return s3Url;
    }

    /**
     * 이미지 리사이징 (최대 1920x1080)
     */
    private byte[] resizeImage(MultipartFile file, String ext) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage originalImage = ImageIO.read(inputStream);
            
            if (originalImage == null) {
                // 이미지가 아닌 경우 원본 파일 반환
                return file.getBytes();
            }

            // 이미지 크기 제한
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

                // BufferedImage를 byte[]로 변환
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                String formatName = ext.substring(1); // .jpg -> jpg
                ImageIO.write(resizedImage, formatName, baos);
                return baos.toByteArray();
            } else {
                // 원본 크기가 제한보다 작으면 원본 반환
                return file.getBytes();
            }
        }
    }

    /**
     * S3에서 파일 삭제 (필요시 사용)
     */
    public void deleteFile(String fileName) {
        try {
            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key(fileName)
                    .build());
            log.info("파일 삭제 완료: {}", fileName);
        } catch (Exception e) {
            log.error("파일 삭제 실패: {}", fileName, e);
            throw new RuntimeException("파일 삭제에 실패했습니다", e);
        }
    }
}

