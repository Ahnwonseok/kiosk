package com.kiosk.controller;

import com.kiosk.dto.OrderRequestDto;
import com.kiosk.dto.ProductCategoryResponse;
import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.OrderStatus;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.service.OrdersService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RestController
public class OrderController {

    private final OrdersRepository ordersRepository;
    private final OrdersService ordersService;

    @GetMapping("/api/orders")
    public List<Orders> orderList() {
        List<Orders> orders = ordersRepository.findTodayOrders();

        return orders;
    }

    @PostMapping("/api/orders")
    public ResponseEntity<Long> createOrder(@RequestBody OrderRequestDto orderRequestDto) {
        Long orderId = ordersService.createOrder(orderRequestDto);
        return ResponseEntity.ok(orderId);
    }

    @PutMapping("/api/orders/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        ordersService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/orders/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        ordersService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
