package com.kiosk.repository;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findTopByOrderByIdDesc();

    // 오늘 주문만 조회
    @Query("SELECT o FROM Orders o WHERE DATE(o.orderDatetime) = CURRENT_DATE")
    List<Orders> findTodayOrders();

    // 특정 날짜의 주문 조회
    @Query("SELECT o FROM Orders o WHERE DATE(o.orderDatetime) = :date")
    List<Orders> findOrdersByDate(@Param("date") String date);

//    Integer save(Orders orders);
}
