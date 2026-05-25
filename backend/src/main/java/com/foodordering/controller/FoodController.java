package com.foodordering.controller;

import com.foodordering.dto.FoodItemDTO;
import com.foodordering.model.FoodItem;
import com.foodordering.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<List<FoodItemDTO>> getAllFoodItems() {
        return ResponseEntity.ok(foodService.getAllFoodItems());
    }

    @GetMapping("/restaurant/{id}")
    public ResponseEntity<List<FoodItemDTO>> getFoodItemsByRestaurant(@PathVariable String id) {
        return ResponseEntity.ok(foodService.getFoodItemsByRestaurant(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItemDTO> createFoodItem(@RequestBody FoodItem foodItem, @RequestParam String restaurantId) {
        return ResponseEntity.ok(foodService.createFoodItem(foodItem, restaurantId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItemDTO> updateFoodItem(@PathVariable String id, @RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodService.updateFoodItem(id, foodItem));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable String id) {
        foodService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
}
