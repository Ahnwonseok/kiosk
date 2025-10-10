package com.kiosk.repository;

import com.kiosk.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p JOIN FETCH p.category")
    List<Product> findAllWithCategory();

    boolean existsByCategoryId(Long categoryId);

    List<Product> findByCategoryId(Long categoryId);
}
