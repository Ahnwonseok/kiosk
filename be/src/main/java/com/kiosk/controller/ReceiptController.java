package com.kiosk.controller;

import com.kiosk.dto.ReceiptResponseDto;
import com.kiosk.entity.Receipt;
import com.kiosk.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class ReceiptController {

    private final ReceiptService receiptService;

        @GetMapping("/api/receipt")
    public ReceiptResponseDto getReceiptInformation(@RequestParam Long orderId) {
        Receipt receipt = receiptService.getReceiptInformation(orderId);
        return ReceiptResponseDto.from(receipt);
    }
}
