package com.foodordering.repository;

import com.foodordering.model.FoodItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import java.util.Optional;

public interface FoodItemRepository extends MongoRepository<FoodItem, String> {
    List<FoodItem> findByRestaurantId(String restaurantId);
    Optional<FoodItem> findByExternalId(String externalId);
}
