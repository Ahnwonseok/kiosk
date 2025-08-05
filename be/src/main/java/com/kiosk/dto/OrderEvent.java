package com.kiosk.dto;

import com.kiosk.entity.OrderStatus;
import com.kiosk.entity.Orders;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String type; // NEW_ORDER, STATUS_CHANGE, ORDER_DELETED
    private Long orderId;
    private OrderStatus status;
    private Orders order;
} 