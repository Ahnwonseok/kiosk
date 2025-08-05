package com.kiosk.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiosk.dto.OrderEvent;
import com.kiosk.entity.Orders;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderStreamService {

    private final ObjectMapper objectMapper;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        String emitterId = String.valueOf(System.currentTimeMillis());
        emitters.put(emitterId, emitter);

        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료: {}", emitterId);
            emitters.remove(emitterId);
        });

        emitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃: {}", emitterId);
            emitters.remove(emitterId);
        });

        emitter.onError((ex) -> {
            if (ex instanceof IOException && ex.getMessage().contains("중단")) {
                log.info("클라이언트에서 SSE 연결 중단: {}", emitterId);
            } else {
                log.error("SSE 연결 에러: {}", emitterId, ex);
            }
            emitters.remove(emitterId);
        });

        // 연결 성공 메시지 전송
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("SSE 연결 성공"));
        } catch (IOException e) {
            log.error("SSE 초기 메시지 전송 실패: {}", emitterId, e);
            emitters.remove(emitterId);
        }

        return emitter;
    }

    public void sendOrderUpdate(String eventName, Object data) {
        emitters.entrySet().removeIf(entry -> {
            String emitterId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(objectMapper.writeValueAsString(data)));
                return false; // 연결 유지
            } catch (IOException e) {
                if (e.getMessage().contains("중단")) {
                    log.info("클라이언트에서 연결 중단됨: {}", emitterId);
                } else {
                    log.warn("SSE 메시지 전송 실패: {}", emitterId, e);
                }
                return true; // 연결 제거
            } catch (Exception e) {
                log.error("SSE 메시지 전송 중 예상치 못한 오류: {}", emitterId, e);
                return true; // 연결 제거
            }
        });
    }

    public void sendNewOrder(Orders order) {
        OrderEvent event = OrderEvent.builder()
                .type("NEW_ORDER")
                .orderId(order.getId())
                .order(order)
                .build();
        sendOrderUpdate("message", event);
    }

    public void sendOrderStatusUpdate(Orders order) {
        OrderEvent event = OrderEvent.builder()
                .type("STATUS_CHANGE")
                .orderId(order.getId())
                .status(order.getOrderStatus())
                .order(order)
                .build();
        sendOrderUpdate("message", event);
    }

    public void sendOrderDeleted(Long orderId) {
        OrderEvent event = OrderEvent.builder()
                .type("ORDER_DELETED")
                .orderId(orderId)
                .build();
        sendOrderUpdate("message", event);
    }

    public int getConnectedClientsCount() {
        return emitters.size();
    }

    public void removeAllEmitters() {
        emitters.clear();
        log.info("모든 SSE 연결 제거됨");
    }
} 