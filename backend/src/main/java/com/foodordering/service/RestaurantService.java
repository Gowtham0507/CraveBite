package com.foodordering.service;

import com.foodordering.dto.RestaurantDTO;
import com.foodordering.model.Restaurant;

import java.util.List;

public interface RestaurantService {
    List<RestaurantDTO> getAllRestaurants(Double lat, Double lng);
    RestaurantDTO getRestaurantById(String id);
    RestaurantDTO createRestaurant(Restaurant restaurant);
}
