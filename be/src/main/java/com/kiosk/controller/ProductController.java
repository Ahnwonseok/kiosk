package com.kiosk.controller;

import com.kiosk.dto.ProductCategoryResponse;
import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import com.kiosk.service.CategoryService;
import com.kiosk.service.ProductService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

//@Slf4j
//@AllArgsConstructor
//@RestController
//public class ProductController {
//
//    private final ProductService productService;
//    private final CategoryService categoryService;
//
//    @GetMapping("/products")
//    public List<ProductCategoryResponse> list() {
//        List<ProductCategoryResponse> responses = new ArrayList<>();
//        List<ProductDto> products = productService.findAll(); // 전체 메뉴
//        List<Category> categories = categoryService.findAll(); // 카테고리 정보들
//        for (Category category : categories) {
//            List<ProductDto> productByCategory = products.stream()
//                .filter(product -> product.matchCategoryId(category))
//                .collect(Collectors.toUnmodifiableList());
//            responses.add(new ProductCategoryResponse(category.getCategoryType().name(),
//                category.getId(),
//                productByCategory));
//        }
//        return responses;
//    }
//}

@Slf4j
@RequiredArgsConstructor
@RestController
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    @GetMapping("/api/products")
    public List<ProductCategoryResponse> list() {
        List<Product> products = productService.findAllWithCategory(); // List<Product> 반환
        List<Category> categories = categoryService.findAll();

        return categories.stream()
                .map(category -> new ProductCategoryResponse(
                        category.getCategoryName(),
                        category.getId(),
                        products.stream()
                                .filter(product -> product.getCategory() != null && product.getCategory().getId().equals(category.getId()))
                                .map(product -> new ProductDto(product)) // Product -> ProductDto 변환
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }
}
