package com.kiosk.entity;

import java.util.List;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@AllArgsConstructor
@Builder
@Getter
@ToString
public class Receipt {
    private Orders orders;
    private List<OrderProduct> orderProducts;
    private Payment payment;
}
