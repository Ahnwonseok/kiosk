package com.kiosk.service;

import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrderProductRepository;
import com.kiosk.dto.PaymentRequestDto.CartInDto;
import java.util.List;

import com.kiosk.repository.OrdersRepository;
import com.kiosk.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderProductService {

    private final OrderProductRepository orderProductRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void saveOrderProductsWithOrder(final Orders order, final List<CartInDto> orderProducts) {
        List<OrderProduct> orderProductEntities = orderProducts.stream()
                .map(cartInDto -> {
                    Product product = productRepository.findById(cartInDto.getProductId()).orElse(null);
                            //.orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + cartInDto.getProductId()));

                    return OrderProduct.builder()
                            .order(order)
                            .amount(cartInDto.getAmount())
                            .product(product)
                            .name(cartInDto.getName())
                            .size(cartInDto.getSize())
                            .temperature(cartInDto.getTemperature())
                            .build();
                })
                .toList();

        orderProductRepository.saveAll(orderProductEntities);
    }
}

//        for (PaymentRequestDto.CartInDto orderProduct : orderProducts) {
//            OrderProduct completedOrderProduct = orderProduct.toEntity(orderId);
//            orderProductRepository.save(completedOrderProduct);
//        }