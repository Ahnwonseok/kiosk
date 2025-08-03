package com.kiosk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;
    private Long orderNumber;
    
    @Column(name = "order_datetime", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime orderDatetime;

    @Enumerated(EnumType.STRING) //EnumType.ORDINAL이 기본값
    @Column(name = "status")
    private OrderStatus orderStatus;

    public Orders(Long orderNumber) {
        this.orderNumber = orderNumber;
    }
}
