package com.kiosk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponseDto {

    private String period;
    private List<OrderStatsPointDto> points;
    private long totalRevenue;
    private long totalCompletedOrders;
}
