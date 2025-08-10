package com.kiosk.service;

import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import com.kiosk.repository.CategoryRepository;
import com.kiosk.repository.ProductRepository;
import com.kiosk.repository.OrderProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderProductRepository orderProductRepository;

    public List<ProductDto> findAll() {
        return productRepository.findAll()
            .stream()
            .map(ProductDto::new)
            .collect(Collectors.toUnmodifiableList());
    }

    public Long save(ProductDto productDto) {
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product(productDto, category);
        productRepository.save(product);
        return product.getId();
    }

    public List<Product> findAllWithCategory() {
        return productRepository.findAllWithCategory();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElse(null);
    }

    @Transactional
    public Product update(Long productId, ProductDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getImgUrl() != null) product.setImgUrl(dto.getImgUrl());

        product.setIsBest(dto.isBest());
        product.setHasHot(dto.isHasHot());
        product.setHasIce(dto.isHasIce());
        product.setHasLarge(dto.isHasLarge());
        product.setHasSmall(dto.isHasSmall());

        return productRepository.save(product);
    }

    @Transactional
    public void delete(Long productId) {
        // 먼저 이 상품을 참조하는 주문 항목 삭제
        orderProductRepository.deleteByProduct_Id(productId);
        // 이후 상품 삭제
        productRepository.deleteById(productId);
    }
}
