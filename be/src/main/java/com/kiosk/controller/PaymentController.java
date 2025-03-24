package com.kiosk.controller;

import com.kiosk.dto.PaymentRequestDto.PayByCardInDto;
import com.kiosk.dto.PaymentRequestDto.PayByCashInDto;
import com.kiosk.dto.PaymentResultResponseDto;
import com.kiosk.service.PaymentService;
import java.util.HashMap;
import java.util.Map;

import com.kiosk.exception.ClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/payment/cash")
    public PaymentResultResponseDto payByCash(@RequestBody final PayByCashInDto payByCashInDto) {
        try {
            Long orderId = paymentService.createPaymentByCash(payByCashInDto);
            return handle200(orderId, "현금 결제 성공하였습니다.");
        } catch (ClientException e) {
            return handle400();
        } catch (Exception e) {
            return handle500();
        }
    }


    @PostMapping("/api/payment/card")
    public PaymentResultResponseDto payByCard(@RequestBody final PayByCardInDto payByCardInDto) {
        try {
            Long orderId = paymentService.createPaymentByCard(payByCardInDto);
            return handle200(orderId, "카드 결제 성공하였습니다.");
        } catch (ClientException e) {
            return handle400();
        } catch (Exception e) {
            return handle500();
        }
    }


    private PaymentResultResponseDto handle200(final Long orderId, final String message) {
        Map<String, Object> data = Map.of("orderId", orderId);
        Map<String, Object> errorCode = new HashMap<>();
        errorCode.put("status", 200);
        errorCode.put("code", "SUCCESS");
        errorCode.put("message", message);
        return new PaymentResultResponseDto(true, data, errorCode);
    }

    private PaymentResultResponseDto handle400() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> errorCode = new HashMap<>();
        errorCode.put("status", 400);
        errorCode.put("code", "PaymentError");
        errorCode.put("message", "결제가 실패했습니다. 잠시후에 시도해주세요.");
        return new PaymentResultResponseDto(false, data, errorCode);
    }

    private PaymentResultResponseDto handle500() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> errorCode = new HashMap<>();
        errorCode.put("status", 500);
        errorCode.put("code", "ServerError");
        errorCode.put("message", "서버 에러입니다. 잠시 후에 이용해주세요.");
        return new PaymentResultResponseDto(false, data, errorCode);
    }
}
