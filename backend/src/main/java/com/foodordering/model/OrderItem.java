package com.foodordering.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @DBRef
    private FoodItem foodItem;

    private Integer quantity;
    private Double price;
}
