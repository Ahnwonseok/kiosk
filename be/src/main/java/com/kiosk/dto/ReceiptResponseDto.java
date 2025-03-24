package com.kiosk.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.kiosk.entity.Receipt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@AllArgsConstructor
@Builder
@Getter
@ToString
public class ReceiptResponseDto {

    private OrdersResponseDto orders;
    private List<OrderProductResponseDto> orderProducts;
    private PaymentResponseDto payment;

    public static ReceiptResponseDto from(Receipt receipt) {
        List<OrderProductResponseDto> orderProducts = receipt.getOrderProducts().stream()
            .map(OrderProductResponseDto::from)
            .collect(Collectors.toList());
        PaymentResponseDto payment = PaymentResponseDto.from(receipt.getPayment());
        OrdersResponseDto orders = OrdersResponseDto.from(receipt.getOrders());
        return ReceiptResponseDto.builder()
            .orders(orders)
            .orderProducts(orderProducts)
            .payment(payment)
            .build();
    }
}
