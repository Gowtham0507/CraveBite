package com.foodordering.dto;

import com.foodordering.model.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private String id;
    private String userId;
    private Double totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
    private String paymentMethod;
    private String paymentStatus;
    private String razorpayOrderId;
    private String deliveryAddress;
    private String deliveryPhoneNumber;
}
