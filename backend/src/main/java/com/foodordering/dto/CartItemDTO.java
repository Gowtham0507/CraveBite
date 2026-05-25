package com.foodordering.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private String id;
    private FoodItemDTO foodItem;
    private Integer quantity;
}
