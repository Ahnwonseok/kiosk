package com.kiosk.controller;

import com.kiosk.service.OrderStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/orders")
public class OrderStreamController {

    private final OrderStreamService orderStreamService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamOrders() {
        log.info("SSE 연결 요청 받음");
        return orderStreamService.createEmitter();
    }

    @GetMapping("/stream/status")
    public ResponseEntity<Map<String, Object>> getStreamStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("connectedClients", orderStreamService.getConnectedClientsCount());
        status.put("status", "active");
        return ResponseEntity.ok(status);
    }
} 