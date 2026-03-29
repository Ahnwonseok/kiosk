package com.kiosk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsPointDto {

    private String label;
    private String sortKey;
    private long revenue;
    private long orderCount;
}
