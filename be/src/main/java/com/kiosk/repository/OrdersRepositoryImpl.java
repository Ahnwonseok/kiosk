package com.kiosk.repository;

import com.kiosk.entity.Orders;
import com.kiosk.entity.QOrders;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
public class OrdersRepositoryImpl implements OrdersRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Orders> findTodayOrders() {
        QOrders orders = QOrders.orders;
        LocalDate today = LocalDate.now();
        
        return queryFactory
                .selectFrom(orders)
                .where(orders.orderDatetime.year().eq(today.getYear())
                        .and(orders.orderDatetime.month().eq(today.getMonthValue()))
                        .and(orders.orderDatetime.dayOfMonth().eq(today.getDayOfMonth())))
                .fetch();
    }

    @Override
    public List<Orders> findOrdersByDate(String date) {
        QOrders orders = QOrders.orders;
        LocalDate targetDate = LocalDate.parse(date);
        
        return queryFactory
                .selectFrom(orders)
                .where(orders.orderDatetime.year().eq(targetDate.getYear())
                        .and(orders.orderDatetime.month().eq(targetDate.getMonthValue()))
                        .and(orders.orderDatetime.dayOfMonth().eq(targetDate.getDayOfMonth())))
                .fetch();
    }

    @Override
    public Long findTodayMaxOrderNumber() {
        QOrders orders = QOrders.orders;
        LocalDate today = LocalDate.now();
        
        return queryFactory
                .select(orders.orderNumber.max())
                .from(orders)
                .where(orders.orderDatetime.year().eq(today.getYear())
                        .and(orders.orderDatetime.month().eq(today.getMonthValue()))
                        .and(orders.orderDatetime.dayOfMonth().eq(today.getDayOfMonth())))
                .fetchOne();
    }
}

