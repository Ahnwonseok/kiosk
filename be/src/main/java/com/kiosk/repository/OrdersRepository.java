package com.kiosk.repository;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findTopByOrderByIdDesc();
//    Integer save(Orders orders);
}
