package com.foodordering.service;

import com.foodordering.dto.FoodItemDTO;
import com.foodordering.model.FoodItem;

import java.util.List;

public interface FoodService {
    List<FoodItemDTO> getAllFoodItems();
    List<FoodItemDTO> getFoodItemsByRestaurant(String restaurantId);
    FoodItemDTO getFoodItemById(String id);
    FoodItemDTO createFoodItem(FoodItem foodItem, String restaurantId);
    FoodItemDTO updateFoodItem(String id, FoodItem foodItemDetails);
    void deleteFoodItem(String id);
}
