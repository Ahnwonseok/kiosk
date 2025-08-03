package com.kiosk.service;

import com.kiosk.entity.Orders;
import com.kiosk.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private static int today;
    private static Long orderNumber = 0L;

//    public Orders createOrder() {
//        return ordersRepository.save(
//                Orders.builder()
//                        .orderDatetime(LocalDateTime.now())
//                        .build());
//    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public static void setToday() {
        today = ZonedDateTime.now().toLocalDate().getDayOfMonth();
    }

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public static void dailyReset() {
        LocalDate current = ZonedDateTime.now().toLocalDate();
        if (current.getDayOfMonth() - today >= 1) {
            orderNumber = 0L;
        }
    }
}
