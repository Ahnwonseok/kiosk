package com.kiosk.repository;

import com.kiosk.entity.Orders;

import java.util.List;

public interface OrdersRepositoryCustom {
    
    // 오늘 주문만 조회
    List<Orders> findTodayOrders();
    
    // 특정 날짜의 주문 조회
    List<Orders> findOrdersByDate(String date);
    
    // 오늘 날짜의 최대 orderNumber 조회 (없으면 null 반환)
    Long findTodayMaxOrderNumber();
}

