package com.kiosk.service;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.repository.OrderProductRepository;
import com.kiosk.repository.OrdersRepository;
import com.kiosk.entity.Payment;
import com.kiosk.repository.PaymentRepository;
import com.kiosk.entity.Receipt;
import java.util.List;
import java.util.NoSuchElementException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final OrderProductRepository orderProductRepository;
    private final PaymentRepository paymentRepository;
    private final OrdersRepository ordersRepository;

    public Receipt getReceiptInformation(Long orderId) {
        // 해당 주문에 대한 상품만 조회
        List<OrderProduct> products = orderProductRepository.findAllByOrderId(orderId); // orderId에 해당하는 주문 상품만 가져오기
        if (products.isEmpty()) {
            throw new NoSuchElementException("해당 주문에 대한 상품이 없습니다."); // 예외 처리 추가
        }

        // 결제 정보 조회
        Payment payment = paymentRepository.findByOrdersId(orderId)
                .orElseThrow(() -> new NoSuchElementException("해당 주문에 대한 결제 정보가 없습니다.")); // 예외 처리 추가

        // 주문 정보 조회
        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다.")); // 예외 처리 추가

        // Receipt 객체 생성 후 반환
        return new Receipt(orders, products, payment);
    }

}
