package com.kiosk.repository;

import com.kiosk.entity.Category;
import com.kiosk.entity.OrderLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface OrderLogRepository extends JpaRepository<OrderLog, Long> {

    //Map<Long, Long> saveAll(List<OrderLog> orderLogs); //saveAll은 List<OrderLog> 반환

    List<OrderLog> findAllBySalesDate(String localDate);
    List<OrderLog> findBySalesDate(String date);
}
