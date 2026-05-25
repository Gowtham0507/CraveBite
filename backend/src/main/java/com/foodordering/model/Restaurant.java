package com.foodordering.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    private String id;

    private String name;
    private String location;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private String imageUrl;
    private String externalId;
}
