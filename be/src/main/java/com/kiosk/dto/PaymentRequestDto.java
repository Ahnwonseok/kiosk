package com.kiosk.dto;

import static com.kiosk.entity.PaymentMethod.CARD;
import static com.kiosk.entity.PaymentMethod.CASH;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Payment;
import java.util.List;

import com.kiosk.entity.Product;
import com.kiosk.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

public class PaymentRequestDto {

    @Builder
    @NoArgsConstructor(force = true) //필드 강제 초기화
    @AllArgsConstructor
    @Getter
    @Setter
    public static class PayByCashInDto {

        @NonNull
        private List<CartInDto> orderProducts;
        @NonNull
        private Integer totalPrice;
        @NonNull
        private Integer receivedPrice;

        public Payment toEntity(Orders order) {
            return Payment.builder()
                .orders(order)
                .totalPrice(this.totalPrice)
                .receivedPrice(this.receivedPrice)
                .remainedPrice(calculateChange(this.totalPrice, this.receivedPrice))
                .method(CASH)
                .build();
        }
    }

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class PayByCardInDto {

        private List<CartInDto> orderProducts;
        private Integer totalPrice;

        public Payment toEntity(Orders order) {
            final int ZERO = 0;

            return Payment.builder()
                .orders(order)
                .totalPrice(this.totalPrice)
                .receivedPrice(this.totalPrice)
                .remainedPrice(ZERO)
                .method(CARD)
                .build();
        }
    }

    private static Integer calculateChange(final Integer totalPrice, final Integer receivedPrice) {
        if (totalPrice > receivedPrice) {
            throw new RuntimeException("받은 금액보다 총액이 더 큽니다.");
        }

        return receivedPrice - totalPrice;
    }

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class CartInDto {

        private Long productId;
        private String name;
        private Integer amount;
        private String size;
        private String temperature;

//        public OrderProduct toEntity(Orders order, ProductRepository productRepository) {
//            Product product = productRepository.findById(this.productId).orElse(null);
//                    //.orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + this.productId));
//
//            return OrderProduct.builder()
//                    .order(order)
//                    .amount(this.amount)
//                    .product(product)
//                    .name(this.name)
//                    .size(this.size)
//                    .temperature(this.temperature)
//                    .build();
//        }
    }
}
