package com.kiosk.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderProduct {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_product_id")
    private Long id;

    //@JsonIgnore 양방향 관계일 때 무한루프 방지
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "order_id")
    private Orders order;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String name;
    private Integer amount;
    private String size;
    private String temperature;
}
