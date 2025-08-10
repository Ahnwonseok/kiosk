package com.kiosk.service;

import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import com.kiosk.repository.CategoryRepository;
import com.kiosk.repository.ProductRepository;
import com.kiosk.repository.OrderProductRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderProductRepository orderProductRepository;

    public List<Category> findAll(){
        return categoryRepository.findAll();
    }

    public Category create(String categoryName) {
        Category category = Category.builder()
                .categoryName(categoryName)
                .build();
        return categoryRepository.save(category);
    }

    public Category update(Long id, String newCategoryName) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));

        categoryRepository.findByCategoryNameIgnoreCase(newCategoryName)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new IllegalArgumentException("Category name already exists: " + newCategoryName); });

        category.setCategoryName(newCategoryName);
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));

        // 1) 이 카테고리에 속한 모든 상품 조회
        List<Product> products = productRepository.findByCategory_Id(id);

        // 2) 각 상품을 참조하는 주문항목 제거 후 상품 삭제
        for (Product p : products) {
            orderProductRepository.deleteByProduct_Id(p.getId());
        }
        productRepository.deleteAll(products);

        // 3) 카테고리 삭제
        categoryRepository.delete(category);
    }
}
