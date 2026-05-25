package com.foodordering.service.impl;

import com.foodordering.dto.FoodItemDTO;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.FoodItem;
import com.foodordering.model.Restaurant;
import com.foodordering.repository.FoodItemRepository;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.service.FoodService;
import com.foodordering.service.SwiggyScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final SwiggyScraperService swiggyScraperService;

    @Override
    public List<FoodItemDTO> getAllFoodItems() {
        return foodItemRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<FoodItemDTO> getFoodItemsByRestaurant(String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        swiggyScraperService.scrapeMenu(restaurant);
        
        return foodItemRepository.findByRestaurantId(restaurantId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public FoodItemDTO getFoodItemById(String id) {
        FoodItem item = foodItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
        return mapToDTO(item);
    }

    @Override
    public FoodItemDTO createFoodItem(FoodItem foodItem, String restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        foodItem.setRestaurant(restaurant);
        return mapToDTO(foodItemRepository.save(foodItem));
    }

    @Override
    public FoodItemDTO updateFoodItem(String id, FoodItem foodItemDetails) {
        FoodItem existing = foodItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Food not found"));
        existing.setName(foodItemDetails.getName());
        existing.setDescription(foodItemDetails.getDescription());
        existing.setPrice(foodItemDetails.getPrice());
        existing.setCategory(foodItemDetails.getCategory());
        existing.setImageUrl(foodItemDetails.getImageUrl());
        return mapToDTO(foodItemRepository.save(existing));
    }

    @Override
    public void deleteFoodItem(String id) {
        foodItemRepository.deleteById(id);
    }

    private FoodItemDTO mapToDTO(FoodItem foodItem) {
        FoodItemDTO dto = new FoodItemDTO();
        dto.setId(foodItem.getId());
        dto.setName(foodItem.getName());
        dto.setDescription(foodItem.getDescription());
        dto.setPrice(foodItem.getPrice());
        dto.setCategory(foodItem.getCategory());
        dto.setImageUrl(foodItem.getImageUrl());
        dto.setExternalId(foodItem.getExternalId());
        if (foodItem.getRestaurant() != null) {
            dto.setRestaurantId(foodItem.getRestaurant().getId());
        }
        return dto;
    }
}
