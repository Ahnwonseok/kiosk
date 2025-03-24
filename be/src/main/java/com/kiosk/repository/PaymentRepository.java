package com.kiosk.repository;

import com.kiosk.entity.Orders;
import com.kiosk.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
//
//    Long save(Payment payment);
//
//    Optional<Payment> findBy(Long paymentId);

    Optional<Payment> findByOrdersId(Long orderId);

}
