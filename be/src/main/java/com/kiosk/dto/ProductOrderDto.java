package com.kiosk.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class ProductOrderDto {
    private Long productId;
    private String name;
    private String size;
    private String temperature;
    private Integer amount;

    public ProductOrderDto(Long productId, String name, String size, String temperature, Integer amount) {
        this.productId = productId;
        this.name = name;
        this.size = size;
        this.temperature = temperature;
        this.amount = amount;
    }
} 