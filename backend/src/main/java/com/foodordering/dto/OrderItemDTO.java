package com.foodordering.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private String id;
    private FoodItemDTO foodItem;
    private Integer quantity;
    private Double price;
}
