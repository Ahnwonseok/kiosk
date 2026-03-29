package com.kiosk.service;

import com.kiosk.dto.OrderStatsPointDto;
import com.kiosk.dto.OrderStatsResponseDto;
import com.kiosk.dto.ProductOrderDto;
import com.kiosk.entity.OrderProduct;
import com.kiosk.entity.OrderStatus;
import com.kiosk.entity.Orders;
import com.kiosk.entity.Product;
import com.kiosk.repository.OrdersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderStatsService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final OrdersRepository ordersRepository;
    private final OrderProductService orderProductService;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public OrderStatsResponseDto getStats(String periodRaw) {
        String period = normalizePeriod(periodRaw);
        LocalDate today = LocalDate.now(SEOUL);
        return switch (period) {
            case "weekly" -> buildWeekly(today);
            case "monthly" -> buildMonthly(today);
            default -> buildDaily(today);
        };
    }

    private static String normalizePeriod(String periodRaw) {
        if (periodRaw == null) {
            return "daily";
        }
        String p = periodRaw.trim().toLowerCase(Locale.ROOT);
        if (!"daily".equals(p) && !"weekly".equals(p) && !"monthly".equals(p)) {
            return "daily";
        }
        return p;
    }

    private OrderStatsResponseDto buildDaily(LocalDate today) {
        LocalDate from = today.minusDays(13);
        LocalDateTime rangeStart = from.atStartOfDay();
        LocalDateTime rangeEnd = today.plusDays(1).atStartOfDay();

        List<Orders> orders = ordersRepository.findOrdersBetween(rangeStart, rangeEnd);
        Map<LocalDate, long[]> buckets = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            buckets.put(d, new long[]{0L, 0L});
        }
        long totalRev = 0;
        long totalCnt = 0;
        for (Orders o : orders) {
            if (o.getOrderStatus() != OrderStatus.completed) {
                continue;
            }
            LocalDate day = o.getOrderDatetime().toLocalDate();
            long[] agg = buckets.get(day);
            if (agg == null) {
                continue;
            }
            long price = computeOrderTotal(o);
            agg[0] += price;
            agg[1] += 1;
            totalRev += price;
            totalCnt += 1;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("M/d");
        List<OrderStatsPointDto> points = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> e : buckets.entrySet()) {
            points.add(OrderStatsPointDto.builder()
                    .label(e.getKey().format(fmt))
                    .sortKey(e.getKey().toString())
                    .revenue(e.getValue()[0])
                    .orderCount(e.getValue()[1])
                    .build());
        }

        return OrderStatsResponseDto.builder()
                .period("daily")
                .points(points)
                .totalRevenue(totalRev)
                .totalCompletedOrders(totalCnt)
                .build();
    }

    private OrderStatsResponseDto buildWeekly(LocalDate today) {
        LocalDate mondayThisWeek = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        LocalDate firstMonday = mondayThisWeek.minusWeeks(7);
        LocalDateTime rangeStart = firstMonday.atStartOfDay();
        LocalDateTime rangeEnd = today.plusDays(1).atStartOfDay();

        List<Orders> orders = ordersRepository.findOrdersBetween(rangeStart, rangeEnd);

        LinkedHashMap<LocalDate, long[]> buckets = new LinkedHashMap<>();
        for (int i = 0; i < 8; i++) {
            buckets.put(firstMonday.plusWeeks(i), new long[]{0L, 0L});
        }

        long totalRev = 0;
        long totalCnt = 0;
        for (Orders o : orders) {
            if (o.getOrderStatus() != OrderStatus.completed) {
                continue;
            }
            LocalDate orderDay = o.getOrderDatetime().toLocalDate();
            LocalDate weekMonday = orderDay.minusDays(orderDay.getDayOfWeek().getValue() - 1L);
            long[] agg = buckets.get(weekMonday);
            if (agg == null) {
                continue;
            }
            long price = computeOrderTotal(o);
            agg[0] += price;
            agg[1] += 1;
            totalRev += price;
            totalCnt += 1;
        }

        List<OrderStatsPointDto> points = new ArrayList<>();
        for (Map.Entry<LocalDate, long[]> e : buckets.entrySet()) {
            LocalDate ws = e.getKey();
            LocalDate we = ws.plusDays(6);
            String label = ws.getMonthValue() + "/" + ws.getDayOfMonth()
                    + "–" + we.getMonthValue() + "/" + we.getDayOfMonth();
            points.add(OrderStatsPointDto.builder()
                    .label(label)
                    .sortKey(ws.toString())
                    .revenue(e.getValue()[0])
                    .orderCount(e.getValue()[1])
                    .build());
        }

        return OrderStatsResponseDto.builder()
                .period("weekly")
                .points(points)
                .totalRevenue(totalRev)
                .totalCompletedOrders(totalCnt)
                .build();
    }

    private OrderStatsResponseDto buildMonthly(LocalDate today) {
        YearMonth startYm = YearMonth.from(today).minusMonths(11);
        LocalDateTime rangeStart = startYm.atDay(1).atStartOfDay();
        LocalDateTime rangeEnd = today.plusDays(1).atStartOfDay();

        List<Orders> orders = ordersRepository.findOrdersBetween(rangeStart, rangeEnd);

        LinkedHashMap<YearMonth, long[]> buckets = new LinkedHashMap<>();
        YearMonth ym = startYm;
        for (int i = 0; i < 12; i++) {
            buckets.put(ym, new long[]{0L, 0L});
            ym = ym.plusMonths(1);
        }

        YearMonth maxYm = YearMonth.from(today);
        long totalRev = 0;
        long totalCnt = 0;
        for (Orders o : orders) {
            if (o.getOrderStatus() != OrderStatus.completed) {
                continue;
            }
            YearMonth orderYm = YearMonth.from(o.getOrderDatetime().toLocalDate());
            if (orderYm.isBefore(startYm) || orderYm.isAfter(maxYm)) {
                continue;
            }
            long[] agg = buckets.get(orderYm);
            if (agg == null) {
                continue;
            }
            long price = computeOrderTotal(o);
            agg[0] += price;
            agg[1] += 1;
            totalRev += price;
            totalCnt += 1;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy년 M월", Locale.KOREA);
        List<OrderStatsPointDto> points = new ArrayList<>();
        for (Map.Entry<YearMonth, long[]> e : buckets.entrySet()) {
            points.add(OrderStatsPointDto.builder()
                    .label(e.getKey().format(fmt))
                    .sortKey(e.getKey().toString())
                    .revenue(e.getValue()[0])
                    .orderCount(e.getValue()[1])
                    .build());
        }

        return OrderStatsResponseDto.builder()
                .period("monthly")
                .points(points)
                .totalRevenue(totalRev)
                .totalCompletedOrders(totalCnt)
                .build();
    }

    private long computeOrderTotal(Orders order) {
        List<ProductOrderDto> orderItems = orderProductService.getOrderProductsByOrder(order)
                .stream()
                .map(this::toProductOrderDto)
                .toList();
        return orderItems.stream()
                .mapToLong(item -> (long) item.getAmount() * getProductPrice(item.getProductId()))
                .sum();
    }

    private ProductOrderDto toProductOrderDto(OrderProduct orderProduct) {
        return ProductOrderDto.builder()
                .productId(orderProduct.getProduct().getId())
                .name(orderProduct.getName())
                .size(orderProduct.getSize())
                .temperature(orderProduct.getTemperature())
                .amount(orderProduct.getAmount())
                .build();
    }

    private long getProductPrice(Long productId) {
        try {
            Product product = productService.findById(productId);
            return product != null && product.getPrice() != null ? product.getPrice() : 5000L;
        } catch (Exception e) {
            log.warn("상품 가격 조회 실패, 기본 가격 사용. productId: {}", productId);
            return 5000L;
        }
    }
}
