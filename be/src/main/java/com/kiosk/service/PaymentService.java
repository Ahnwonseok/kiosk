package com.kiosk.service;

import com.kiosk.dto.PaymentRequestDto;
import com.kiosk.dto.PaymentRequestDto.PayByCashInDto;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Payment;
import com.kiosk.entity.PaymentMethod;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrdersRepository ordersRepository;
    private final OrderProductService orderProductService;
    private static Long orderNumber = 0L;
    private static int today;

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

    @Transactional
    public Long createPaymentByCash(final PayByCashInDto payByCashInDto) {
        // 주문 생성
        Orders order = new Orders(LocalDateTime.now().toString(), orderNumber++);

        // 주문 상품 저장
        orderProductService.saveOrderProductsWithOrder(order, payByCashInDto.getOrderProducts());

        // 결제 정보 저장
        Payment payment = savePaymentByCash(order, payByCashInDto);

        return payment.getId();
    }

    private Payment savePaymentByCash(Orders order, PayByCashInDto payByCashInDto) {
        Integer remainedPrice = calculateChange(payByCashInDto.getTotalPrice(), payByCashInDto.getReceivedPrice());

        Payment payment = Payment.builder()
                .orders(order)
                .totalPrice(payByCashInDto.getTotalPrice())
                .receivedPrice(payByCashInDto.getReceivedPrice())
                .remainedPrice(remainedPrice)
                .method(PaymentMethod.CASH)
                .build();

        return paymentRepository.save(payment);
    }

    private static Integer calculateChange(final Integer totalPrice, final Integer receivedPrice) {
        if (totalPrice > receivedPrice) {
            throw new IllegalArgumentException("받은 금액보다 총액이 더 큽니다.");
        }
        return receivedPrice - totalPrice;
    }


    @Transactional
    public Long createPaymentByCard(final PaymentRequestDto.PayByCardInDto payByCardInDto) {
        // 주문 생성
        Orders order = new Orders(LocalDateTime.now().toString(), orderNumber++);

        // 주문 상품 저장
        orderProductService.saveOrderProductsWithOrder(order, payByCardInDto.getOrderProducts());

        // 주문 저장
        Payment payment = savePaymentByCard(order, payByCardInDto);

        paymentRepository.save(payment);

        return payment.getId();
    }

//    public Long getLastOrderNumber() {
//        return ordersRepository.findTopByOrderByIdDesc()
//                .map(Orders::getOrderNumber)
//                .orElseThrow(() -> new NoSuchElementException("최근 주문이 존재하지 않습니다."));
//    }

    private Payment savePaymentByCard(Orders order, PaymentRequestDto.PayByCardInDto payByCardInDto) {
        Payment payment = Payment.builder()
                .orders(order)
                .totalPrice(payByCardInDto.getTotalPrice())
                .receivedPrice(payByCardInDto.getTotalPrice())
                .remainedPrice(0)
                .method(PaymentMethod.CARD)
                .build();

        return paymentRepository.save(payment);
    }
}
