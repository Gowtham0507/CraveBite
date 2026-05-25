package com.foodordering.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;

@Document(collection = "food_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {
    @Id
    private String id;

    private String name;
    private String description;
    private Double price;
    private String category;
    private String imageUrl;
    private String externalId;

    @DBRef
    private Restaurant restaurant;
}
