package com.kiosk.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class Payment {

    @Id @GeneratedValue
    @Column(name = "payment_id")
    private Long Id;

    @OneToOne(fetch = LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private Orders orders;

    private Integer totalPrice;
    private Integer receivedPrice;
    private Integer remainedPrice;
    private LocalDateTime orderDate; //주문시간

    @Enumerated(EnumType.STRING) //EnumType.ORDINAL이 기본값
    private PaymentMethod method;

//    public void Orders (Long id) {
//        Orders orders = new Orders();
//        this.orders.setId(id);
//    }
}
