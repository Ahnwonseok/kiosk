package com.kiosk.repository;

import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Payment;
import com.kiosk.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p JOIN FETCH p.category")
    List<Product> findAllWithCategory();
//    Long save(ProductDto productDto);
//
//    List<Product> findAll();
//
//    Optional<Product> findBy(Long id);
//
//    int deleteAll();
//
//    void updateBestProducts(List<Product> bestProducts);
}
