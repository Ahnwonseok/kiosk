package com.kiosk.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private String orderDatetime;

    public Orders (String orderDatetime, Long orderNumber) {
        this.orderDatetime = orderDatetime;
        this.orderNumber = orderNumber;
    }
}
