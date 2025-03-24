package com.kiosk.entity;

import com.kiosk.dto.ProductDto;
import com.kiosk.repository.CategoryRepository;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@ToString
public class Product {

    @Id @GeneratedValue
    @Column(name = "product_id")
    private Long id;            // 상품 아이디
    private String name;        // 이름
    private Long price;         // 가격
    private String imgUrl;       // 이미지 저장 경로
    private boolean isBest;     // 인기 상품
    private boolean hasHot;     // 핫 가능 여부
    private boolean hasIce;     // 아이스 가능 여부
    private boolean hasLarge;   // 라지 사이즈 가능 여부
    private boolean hasSmall;   // 스몰 사이즈 가능 여부

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "category_id")
    private Category category;  // 종류

    public Product (Long id) {
        this.id = id;
    }

    public Product(ProductDto productDto, Category category) {
        this.name = productDto.getName();
        this.price = productDto.getPrice();
        this.imgUrl = productDto.getImgUrl();
        this.isBest = productDto.isBest();
        this.hasHot = productDto.isHasHot();
        this.hasIce = productDto.isHasIce();
        this.hasLarge = productDto.isHasLarge();
        this.hasSmall = productDto.isHasSmall();
        this.category = category;
    }

    public void setIsBest(boolean isBest) {
        this.isBest = isBest;
    }
    public void updateIsBestFalseAll(Product product) {
        product.setIsBest(false);
    }
}
