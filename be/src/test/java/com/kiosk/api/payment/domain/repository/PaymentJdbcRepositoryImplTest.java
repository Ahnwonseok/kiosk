package com.kiosk.api.payment.domain.repository;

import com.kiosk.entity.Orders;
import com.kiosk.entity.Payment;
import com.kiosk.entity.PaymentMethod;
import com.kiosk.repository.PaymentRepository;
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
class PaymentJdbcRepositoryImplTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("결제 정보가 주어지고 저장 요청시 저장소에 저장된다.")
    public void save() {
        Orders orders = new Orders();

        // given
        Payment payment = Payment.builder()
            .orders(orders)
            .totalPrice(10000)
            .receivedPrice(10000)
            .remainedPrice(0)
            .method(PaymentMethod.CARD)
            .build();
        // when
        Payment findPayment = paymentRepository.save(payment);
        // then
        SoftAssertions.assertSoftly(softAssertions -> {
            //Payment findPayment = paymentRepository.findById(paymentId).orElseThrow();
            softAssertions.assertThat(findPayment.getId()).isEqualTo(payment.getId());
            softAssertions.assertThat(findPayment.getTotalPrice()).isEqualTo(10000);
            softAssertions.assertThat(findPayment.getReceivedPrice()).isEqualTo(10000);
            softAssertions.assertThat(findPayment.getRemainedPrice()).isEqualTo(0);
            softAssertions.assertThat(findPayment.getMethod()).isEqualTo(PaymentMethod.CARD);
            softAssertions.assertAll();
        });
    }
}
