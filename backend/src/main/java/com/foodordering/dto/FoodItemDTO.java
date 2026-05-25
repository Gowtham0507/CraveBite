package com.foodordering.dto;

import lombok.Data;

@Data
public class FoodItemDTO {
    private String id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private String imageUrl;
    private String externalId;
    private String restaurantId;
}
