package com.kiosk.controller;

import com.kiosk.dto.OrderRequestDto;
import com.kiosk.dto.ManagedOrderResponseDto;
import com.kiosk.dto.ProductOrderDto;
import com.kiosk.dto.ProductCategoryResponse;
import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Orders;
import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Product;
import com.kiosk.entity.OrderStatus;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.service.OrderProductService;
import com.kiosk.service.OrdersService;
import com.kiosk.service.OrderStreamService;
import com.kiosk.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RequiredArgsConstructor
@RestController
public class OrderController {

    private final OrdersRepository ordersRepository;
    private final OrdersService ordersService;
    private final OrderProductService orderProductService;
    private final OrderStreamService orderStreamService;
    private final ProductService productService;

    @GetMapping("/api/orders")
    public List<ManagedOrderResponseDto> orderList() {
        List<Orders> orders = ordersRepository.findTodayOrders();
        
        return orders.stream()
                .map(this::convertToManagedOrderDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/api/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequestDto orderRequest) {
        Map<String, Object> body = new HashMap<>();
        try {
            // 서비스에 위임: 하루 기준 0부터 증가하는 orderNumber를 생성하고 주문 저장 및 SSE 전송까지 수행
            Long orderNumber = ordersService.createOrder(orderRequest);

            log.info("주문이 성공적으로 생성되었습니다. 주문번호: {}", orderNumber);
            body.put("success", true);
            body.put("message", "주문이 성공적으로 생성되었습니다.");
            body.put("orderId", orderNumber);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("주문 생성 중 오류 발생: {}", e.getMessage());
            body.put("success", false);
            body.put("message", "주문 생성에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @PutMapping("/api/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        Map<String, Object> body = new HashMap<>();
        try {
            Orders order = ordersRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            
            order.setOrderStatus(status);
            ordersRepository.save(order);
            
            // SSE 이벤트 전송 (주문 상태 변경 알림)
            orderStreamService.sendOrderStatusUpdate(order);
            
            log.info("주문 상태가 업데이트되었습니다. 주문ID: {}, 상태: {}", orderId, status);
            body.put("success", true);
            body.put("message", "주문 상태가 업데이트되었습니다.");
            body.put("orderId", orderId);
            body.put("status", status.name());
            return ResponseEntity.ok(body);
            
        } catch (Exception e) {
            log.error("주문 상태 업데이트 중 오류 발생: {}", e.getMessage());
            body.put("success", false);
            body.put("message", "주문 상태 업데이트에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    @DeleteMapping("/api/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> deleteOrder(@PathVariable Long orderId) {
        Map<String, Object> body = new HashMap<>();
        try {
            Orders order = ordersRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            
            // 자식 행 먼저 삭제
            orderProductService.deleteOrderProductsByOrder(order);
            
            // SSE 이벤트 전송 (주문 삭제 알림)
            orderStreamService.sendOrderDeleted(orderId);
            
            // 부모 주문 삭제
            ordersRepository.deleteById(orderId);
            
            log.info("주문이 삭제되었습니다. 주문ID: {}", orderId);
            body.put("success", true);
            body.put("message", "주문이 삭제되었습니다.");
            body.put("orderId", orderId);
            return ResponseEntity.ok(body);
            
        } catch (Exception e) {
            log.error("주문 삭제 중 오류 발생: {}", e.getMessage());
            body.put("success", false);
            body.put("message", "주문 삭제에 실패했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(body);
        }
    }

    private ManagedOrderResponseDto convertToManagedOrderDto(Orders order) {
        // OrderProduct 정보 가져오기
        List<ProductOrderDto> orderItems = orderProductService.getOrderProductsByOrder(order)
                .stream()
                .map(this::convertToProductOrderDto)
                .collect(Collectors.toList());

        // 총 가격 계산
        Long totalPrice = orderItems.stream()
                .mapToLong(item -> (long) (item.getAmount() * getProductPrice(item.getProductId())))
                .sum();

        return ManagedOrderResponseDto.builder()
                .orderId(order.getId().toString())
                .orderNumber(order.getOrderNumber().toString())
                .orderTime(order.getOrderDatetime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .orderItems(orderItems)
                .status(order.getOrderStatus().name())
                .totalPrice(totalPrice)
                .build();
    }

    private ProductOrderDto convertToProductOrderDto(OrderProduct orderProduct) {
        return ProductOrderDto.builder()
                .productId(orderProduct.getProduct().getId())
                .name(orderProduct.getName())
                .size(orderProduct.getSize())
                .temperature(orderProduct.getTemperature())
                .amount(orderProduct.getAmount())
                .build();
    }

    private Long getProductPrice(Long productId) {
        try {
            Product product = productService.findById(productId);
            return product != null ? product.getPrice() : 5000L;
        } catch (Exception e) {
            log.warn("상품 가격 조회 실패, 기본 가격 사용. productId: {}", productId);
            return 5000L; // 기본 가격
        }
    }
}
