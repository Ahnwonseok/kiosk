package com.kiosk.service;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.OrderStatus;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrderProductRepository;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.batch.daily-orders", name = "enabled", havingValue = "true")
public class DailyRandomOrderBatchService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final OrdersRepository ordersRepository;
    private final OrderProductRepository orderProductRepository;
    private final ProductRepository productRepository;

    @Value("${app.batch.daily-orders.max-per-day:30}")
    private int maxPerDay;

    @Value("${app.batch.daily-orders.min-lines-per-order:1}")
    private int minLinesPerOrder;

    @Value("${app.batch.daily-orders.max-lines-per-order:3}")
    private int maxLinesPerOrder;

    @Value("${app.batch.daily-orders.start-hour:8}")
    private int startHour;

    @Value("${app.batch.daily-orders.end-hour:20}")
    private int endHour;

    private final Random random = new Random();

    /** 기본: 매일 서울 03:00 */
    @Scheduled(cron = "${app.batch.daily-orders.cron:0 0 3 * * *}", zone = "Asia/Seoul")
    @Transactional
    public void createRandomOrdersDaily() {
        if (maxPerDay < 1 || maxPerDay > 30) {
            log.error("[daily-order-batch] max-per-day는 1~30이어야 합니다. 현재={}", maxPerDay);
            return;
        }
        if (minLinesPerOrder < 1 || maxLinesPerOrder < minLinesPerOrder) {
            log.error("[daily-order-batch] 주문 라인 설정이 유효하지 않습니다. min={}, max={}", minLinesPerOrder, maxLinesPerOrder);
            return;
        }
        if (startHour < 0 || endHour > 23 || startHour > endHour) {
            log.error("[daily-order-batch] start-hour/end-hour가 유효하지 않습니다.");
            return;
        }

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("[daily-order-batch] 상품이 없어 주문 생성 생략");
            return;
        }

        int ordersToCreate = random.nextInt(0, maxPerDay + 1);
        if (ordersToCreate == 0) {
            log.info("[daily-order-batch] 오늘 생성 주문 0건");
            return;
        }

        Long todayMax = ordersRepository.findTodayMaxOrderNumber();
        long nextOrderNumber = (todayMax == null ? -1 : todayMax) + 1;

        LocalDate today = LocalDate.now(SEOUL);
        int createdLines = 0;
        for (int i = 0; i < ordersToCreate; i++) {
            LocalDateTime orderAt = LocalDateTime.of(
                    today,
                    LocalTime.of(
                            random.nextInt(startHour, endHour + 1),
                            random.nextInt(0, 60),
                            random.nextInt(0, 60)));

            Orders order = ordersRepository.save(Orders.builder()
                    .orderNumber(nextOrderNumber++)
                    .orderDatetime(orderAt)
                    .orderStatus(OrderStatus.completed)
                    .build());

            int lineCount = random.nextInt(minLinesPerOrder, maxLinesPerOrder + 1);
            for (int j = 0; j < lineCount; j++) {
                Product product = products.get(random.nextInt(products.size()));
                int amount = random.nextInt(1, 4);
                int unitPrice = product.getPrice() == null ? 0 : product.getPrice().intValue();

                OrderProduct orderProduct = OrderProduct.builder()
                        .order(order)
                        .product(product)
                        .name(product.getName())
                        .amount(amount)
                        .size(product.isHasLarge() && random.nextBoolean() ? "Large" : "Small")
                        .temperature(pickTemperature(product))
                        .unitPrice(unitPrice)
                        .totalPrice(unitPrice * amount)
                        .build();

                orderProductRepository.save(orderProduct);
                createdLines++;
            }
        }

        log.info("[daily-order-batch] 주문 {}건, 주문 라인 {}건 생성 (상한 {}건 이하 랜덤)", ordersToCreate, createdLines, maxPerDay);
    }

    private String pickTemperature(Product product) {
        if (product.isHasIce() && product.isHasHot()) {
            return random.nextBoolean() ? "Ice" : "Hot";
        }
        if (product.isHasIce()) return "Ice";
        return "Hot";
    }
}
