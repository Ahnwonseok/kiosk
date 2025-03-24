package com.kiosk.dto;

import com.kiosk.entity.Payment;
import com.kiosk.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Builder
@Getter
public class PaymentResponseDto {

    private int totalPrice;
    private int receivedPrice;
    private int remainedPrice;
    private PaymentMethod method;

    public static PaymentResponseDto from(Payment payment) {
        return PaymentResponseDto.builder()
                .totalPrice(payment.getTotalPrice())
                .receivedPrice(payment.getReceivedPrice())
                .remainedPrice(payment.getRemainedPrice())
                .method(payment.getMethod())
                .build();
    }
}
