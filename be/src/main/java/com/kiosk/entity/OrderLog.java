package com.kiosk.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

@Getter
@Builder
@ToString
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class OrderLog {
    @Id @GeneratedValue
    @Column(name = "orderlog_id")
    private Long id;
    private String salesDate;
    private Long categoryId;
    private Long productId;
    private Long salesAmount;
}
