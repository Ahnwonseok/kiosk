package com.kiosk.api.order.domain.repository;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.kiosk.repository.OrdersRepository;
import com.kiosk.service.OrdersService;
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

// Repository 애노테이션이 붙은 클래스만 빈으로 등록
@DataJpaTest(includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Repository.class))
// Replace.NONE으로 설정하면 @ActiveProfiles에 설정한 프로파일 환경값에 따라 데이터소스가 적용된다.
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles(profiles = {"test"})
class OrdersJdbcRepositoryImplTest {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrdersService ordersService;

    @Test
    @DisplayName("자정이 되면 주문번호가 0으로 초기화됩니다.")
    public void dailyReset() throws NoSuchFieldException, IllegalAccessException {
        // given
        LocalDate yesterday = LocalDateTime.now().minusDays(1).toLocalDate();
        Field orderNumber = ordersRepository.getClass().getDeclaredField("orderNumber");
        orderNumber.setAccessible(true);
        Field today = ordersRepository.getClass().getDeclaredField("today");
        today.setAccessible(true);
        today.set(ordersRepository, yesterday.getDayOfMonth());
        // 주문번호가 5가 된 상태
        orderNumber.set(ordersRepository, 5L);
        // when
        OrdersService.dailyReset();
        // then
        Long findOrderNumber = (Long) orderNumber.get(OrdersService.class);
        SoftAssertions.assertSoftly(softAssertions -> {
            softAssertions.assertThat(findOrderNumber).isEqualTo(0L);
            softAssertions.assertAll();
        });
    }
}
