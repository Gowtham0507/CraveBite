package com.foodordering.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    private String id;

    @DBRef
    private User user;

    private Double totalAmount;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private List<OrderItem> items;

    // Payment fields
    private String paymentMethod; // "ONLINE" or "COD"
    private String paymentStatus; // "PENDING", "COMPLETED", "FAILED"
    private String razorpayOrderId;

    // Delivery fields
    private String deliveryAddress;
    private String deliveryPhoneNumber;
}
