package com.foodordering.dto;

import lombok.Data;

@Data
public class RestaurantDTO {
    private String id;
    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private String imageUrl;
    private String externalId;
}
