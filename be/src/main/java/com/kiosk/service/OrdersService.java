package com.kiosk.service;

import com.kiosk.dto.OrderRequestDto;
import com.kiosk.dto.PaymentRequestDto;
import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final ProductRepository productRepository;
    private final OrderProductService orderProductService;
    private static int today;
    private static Long orderNumber = 0L;

    public Long createOrder(OrderRequestDto orderRequestDto) {
        // 주문 생성
        Orders order = Orders.builder()
                .orderNumber(orderNumber++)
                .orderStatus(com.kiosk.entity.OrderStatus.waiting)
                .build();
        Orders savedOrder = ordersRepository.save(order);
        // OrderRequestDto를 CartInDto로 변환
        List<PaymentRequestDto.CartInDto> cartItems = orderRequestDto.getOrderItems().stream()
                .map(item -> new PaymentRequestDto.CartInDto(
                        item.getProductId(),
                        item.getName(),
                        item.getAmount(),
                        item.getSize(),
                        item.getTemperature()
                ))
                .collect(Collectors.toList());

        // 주문 상품 저장
        orderProductService.saveOrderProductsWithOrder(savedOrder, cartItems);

        return savedOrder.getId();
    }

//    public Orders createOrder() {
//        return ordersRepository.save(
//                Orders.builder()
//                        .orderDatetime(LocalDateTime.now())
//                        .build());
//    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public static void setToday() {
        today = ZonedDateTime.now().toLocalDate().getDayOfMonth();
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public static void dailyReset() {
        LocalDate current = ZonedDateTime.now().toLocalDate();
        if (current.getDayOfMonth() - today >= 1) {
            orderNumber = 0L;
        }
    }
}
