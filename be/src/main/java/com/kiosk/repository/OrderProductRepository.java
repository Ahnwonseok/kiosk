package com.kiosk.repository;

import com.kiosk.entity.OrderLog;
import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OrderProductRepository extends JpaRepository<OrderProduct, Long> {

    List<OrderProduct> findAllByOrderId(Long orderId);

    List<OrderProduct> findByOrder(Orders order);

    void deleteByOrder(Orders order);

    //List<OrderProduct> findByOrderId(Long );
}
