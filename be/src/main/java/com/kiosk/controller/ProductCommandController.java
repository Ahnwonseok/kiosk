package com.kiosk.controller;

import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Product;
import com.kiosk.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class ProductCommandController {

    private final ProductService productService;

    @PostMapping("/api/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody ProductDto request) {
        Map<String, Object> body = new HashMap<>();
        try {
            Long id = productService.save(request);
            body.put("success", true);
            body.put("id", id);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @PutMapping("/api/products/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto request) {
        Map<String, Object> body = new HashMap<>();
        try {
            Product updated = productService.update(id, request);
            body.put("success", true);
            body.put("id", updated.getId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        Map<String, Object> body = new HashMap<>();
        try {
            productService.delete(id);
            body.put("success", true);
            body.put("id", id);
            body.put("message", "Product deleted");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }
}