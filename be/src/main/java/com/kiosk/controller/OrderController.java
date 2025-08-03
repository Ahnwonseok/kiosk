package com.kiosk.controller;

import com.kiosk.dto.ProductCategoryResponse;
import com.kiosk.dto.ProductDto;
import com.kiosk.entity.Category;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.Order;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RestController
public class OrderController {

    private final OrdersRepository ordersRepository;

    @GetMapping("/api/orders")
    public List<Orders> orderList() {
        List<Orders> orders = ordersRepository.findTodayOrders();

        return orders;
    }
}
