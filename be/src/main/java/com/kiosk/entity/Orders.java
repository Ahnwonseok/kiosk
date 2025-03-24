package com.kiosk.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue
    @Column(name = "order_id")
    private Long id;
    private Long orderNumber;
    private String orderDatetime;

    public Orders (String orderDatetime, Long orderNumber) {
        this.orderDatetime = orderDatetime;
        this.orderNumber = orderNumber;
    }
}
