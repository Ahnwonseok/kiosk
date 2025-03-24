package com.kiosk.domain.repository;

import static com.kiosk.entity.CategoryType.COFFEE;

import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Product;
import com.kiosk.repository.CategoryRepository;
import com.kiosk.repository.ProductRepository;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.stereotype.Repository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

// Repository 애노테이션이 붙은 클래스만 빈으로 등록
@DataJpaTest(includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Repository.class))
// Replace.NONE으로 설정하면 @ActiveProfiles에 설정한 프로파일 환경값에 따라 데이터소스가 적용된다.
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles(profiles = {"test"})
class ProductJdbcRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    @Test
    @DisplayName("상품 정보가 주어지고 저장 요청을 했을때 저장소에 저장된다")
    public void save() {
        // given
        Category category = categoryRepository.findByCategoryType(COFFEE.name())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        //Category category = Category.builder().id(category_id).categoryType(COFFEE).build();
        Product product = Product.builder()
            .name("에스프레소")
            .price(4000L)
            .imgUrl("imageUrl")
            .isBest(false)
            .hasHot(true)
            .hasIce(true)
            .hasLarge(true)
            .hasSmall(true)
            .category(category)
            .build();
        //ProductDto productDto = new ProductDto(product);
        // when
        Product findProduct = productRepository.save(product);
        // then
        //Product findProduct = productRepository.findById(id).orElseThrow();
        SoftAssertions.assertSoftly(softAssertions -> {
            softAssertions.assertThat(findProduct.getId()).isEqualTo(product.getId());
        });
    }

    @Test
    @DisplayName("상품 정보들을 요청하고 성공적으로 응답한다")
    @Transactional
    public void findAll() {
        // when
        List<Product> products = productRepository.findAll();
        // then
        SoftAssertions.assertSoftly(softAssertions -> {
            softAssertions.assertThat(products.size()).isEqualTo(25);
            softAssertions.assertAll();
        });
    }
}
