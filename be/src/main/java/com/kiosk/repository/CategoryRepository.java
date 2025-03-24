package com.kiosk.repository;

import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCategoryType(String name);
//    Long save(Category category);
//
//    List<Category> findAll();
//
//    Optional<Category> findBy(Long id);
//
//    Optional<Category> findBy(String name);

    //int deleteAll();
}
