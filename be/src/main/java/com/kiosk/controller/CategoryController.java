package com.kiosk.controller;

import com.kiosk.dto.CategoryCreateRequest;
import com.kiosk.entity.Category;
import com.kiosk.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping("/api/categories")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody CategoryCreateRequest request) {
        Map<String, Object> body = new HashMap<>();
        try {
            Category created = categoryService.create(request.getCategoryName());
            body.put("success", true);
            body.put("id", created.getId());
            body.put("categoryName", created.getCategoryName());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @PutMapping("/api/categories/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryCreateRequest request) {
        Map<String, Object> body = new HashMap<>();
        try {
            Category updated = categoryService.update(id, request.getCategoryName());
            body.put("success", true);
            body.put("id", updated.getId());
            body.put("categoryName", updated.getCategoryName());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @DeleteMapping("/api/categories/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable Long id) {
        Map<String, Object> body = new HashMap<>();
        try {
            categoryService.delete(id);
            body.put("success", true);
            body.put("id", id);
            body.put("message", "Category deleted");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }
}