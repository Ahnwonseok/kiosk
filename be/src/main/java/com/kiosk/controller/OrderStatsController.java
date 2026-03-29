package com.kiosk.controller;

import com.kiosk.dto.OrderStatsResponseDto;
import com.kiosk.service.OrderStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OrderStatsController {

    private final OrderStatsService orderStatsService;

    @GetMapping("/api/orders/stats")
    public OrderStatsResponseDto orderStats(@RequestParam(defaultValue = "daily") String period) {
        return orderStatsService.getStats(period);
    }
}
