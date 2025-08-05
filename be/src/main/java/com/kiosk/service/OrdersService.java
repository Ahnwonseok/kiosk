package com.kiosk.service;

import com.kiosk.dto.OrderRequestDto;
import com.kiosk.dto.PaymentRequestDto;
import com.kiosk.entity.OrderStatus;
import com.kiosk.entity.Orders;
import com.kiosk.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final OrderProductService orderProductService;
    private final OrderStreamService orderStreamService;
    private static Long orderNumber = 0L;
    private static int today;

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

        // SSE로 새 주문 알림 전송
        orderStreamService.sendNewOrder(savedOrder);

        return savedOrder.getId();
    }

    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));
        
        order.setOrderStatus(status);
        Orders updatedOrder = ordersRepository.save(order);
        
        // SSE로 주문 상태 변경 알림 전송
        orderStreamService.sendOrderStatusUpdate(updatedOrder);
    }

    public void deleteOrder(Long orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));
        
        ordersRepository.delete(order);
        
        // SSE로 주문 삭제 알림 전송
        orderStreamService.sendOrderDeleted(orderId);
    }

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
