package com.kiosk.service;

import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import com.kiosk.repository.CategoryRepository;
import com.kiosk.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

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
}
