package com.foodordering.service.impl;

import com.foodordering.dto.RestaurantDTO;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.Restaurant;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.service.RestaurantService;
import com.foodordering.service.SwiggyScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final SwiggyScraperService swiggyScraperService;

    @Override
    public List<RestaurantDTO> getAllRestaurants(Double lat, Double lng) {
        
        if (lat != null && lng != null) {
            // HYDRATE FROM SWIGGY IN REAL TIME
            swiggyScraperService.scrapeRestaurants(lat, lng);
            
            // Now pull from H2 Database
            List<Restaurant> allRestaurants = restaurantRepository.findAll();
            return allRestaurants.stream()
                    .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                    .filter(r -> calculateDistance(lat, lng, r.getLatitude(), r.getLongitude()) <= 15.0)
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        return allRestaurants.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    }

    @Override
    public RestaurantDTO getRestaurantById(String id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return mapToDTO(restaurant);
    }

    @Override
    public RestaurantDTO createRestaurant(Restaurant restaurant) {
        return mapToDTO(restaurantRepository.save(restaurant));
    }

    private RestaurantDTO mapToDTO(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setLocation(restaurant.getLocation());
        dto.setLatitude(restaurant.getLatitude());
        dto.setLongitude(restaurant.getLongitude());
        dto.setRating(restaurant.getRating());
        dto.setImageUrl(restaurant.getImageUrl());
        return dto;
    }
}
