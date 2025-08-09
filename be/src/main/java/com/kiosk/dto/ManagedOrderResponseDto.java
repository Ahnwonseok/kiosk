package com.kiosk.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class ManagedOrderResponseDto {
    private String orderId;
    private String orderNumber;
    private String orderTime;
    private List<ProductOrderDto> orderItems;
    private String status;
    private Long totalPrice;

    public ManagedOrderResponseDto(String orderId, String orderNumber, String orderTime, List<ProductOrderDto> orderItems, String status, Long totalPrice) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.orderTime = orderTime;
        this.orderItems = orderItems;
        this.status = status;
        this.totalPrice = totalPrice;
    }
} 