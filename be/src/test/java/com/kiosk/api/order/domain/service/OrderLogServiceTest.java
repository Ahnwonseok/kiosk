package com.kiosk.api.order.domain.service;

import static com.kiosk.entity.PaymentMethod.CARD;

import com.kiosk.entity.OrderLog;
import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.repository.OrderLogRepository;
import com.kiosk.repository.OrderProductRepository;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.service.OrderLogService;
import com.kiosk.entity.Payment;
import com.kiosk.repository.PaymentRepository;
import com.kiosk.entity.Product;
import com.kiosk.repository.ProductRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles(profiles = "test")
class OrderLogServiceTest {

    @Autowired
    private OrderLogService orderLogService;

    @Autowired
    private OrderLogRepository orderLogRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrderProductRepository orderProductRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("자정이 될때 order_log 테이블에 판매량을 기록하고 isBest를 갱신하고 주문번호를 초기화한다")
    @Transactional
    public void dailyActions() {
        // given
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        Orders orders = new Orders();
        Product product = new Product();
        // 주문 저장
        ordersRepository.save(
            Orders.builder().orderNumber(1L).orderDatetime(yesterday.toString()).build());
        //OrderProducts
        List<OrderProduct> orderProducts = new ArrayList<>();
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("아메리카노").amount(1).size("small").temperature("ice")
                        .build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("카라멜 마키아또").amount(2).size("small").temperature("hot")
                        .build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("롱블랙").amount(3).size("small").temperature("ice")
                        .build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("프렌치 아메리카노").amount(4).size("small")
                        .temperature("ice").build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("카페 라떼").amount(1).size("small").temperature("ice")
                        .build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("초콜릿 라떼").amount(1).size("large").temperature("ice")
                        .build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("민트 블렌드 티").amount(1).size("large")
                .temperature("hot").build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("블루밍 프루트 유스베리 티").amount(2).size("small")
                        .temperature("hot").build());
        orderProducts.add(
                OrderProduct.builder().order(orders).product(product).name("딸기 주스").amount(1).size("small").temperature("ice")
                        .build());
        // 주문상품 저장
        orderProductRepository.saveAll(orderProducts);

        // 결제 저장
        paymentRepository.save(
            Payment.builder().orders(orders).method(CARD).totalPrice(10000).receivedPrice(10000)
                .remainedPrice(0).build());

        // when
        orderLogService.dailyActions();
        // then
        List<OrderLog> orderLogs = orderLogRepository.findAllBySalesDate(yesterday.toLocalDate().toString());
        List<Product> bestProducts = productRepository.findAll().stream()
            .filter(Product::isBest)
            .collect(Collectors.toUnmodifiableList());

        SoftAssertions.assertSoftly(softAssertions -> {
            softAssertions.assertThat(orderLogs.size()).isEqualTo(9);
            softAssertions.assertThat(bestProducts.size()).isEqualTo(5);
            softAssertions.assertAll();
        });
    }
}
