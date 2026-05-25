package com.foodordering.service.impl;

import com.foodordering.dto.CartDTO;
import com.foodordering.dto.CartItemDTO;
import com.foodordering.dto.FoodItemDTO;
import com.foodordering.exception.ResourceNotFoundException;
import com.foodordering.model.Cart;
import com.foodordering.model.CartItem;
import com.foodordering.model.FoodItem;
import com.foodordering.model.User;
import com.foodordering.model.*;
import com.foodordering.repository.CartRepository;
import com.foodordering.repository.FoodItemRepository;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.repository.UserRepository;
import com.foodordering.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public CartDTO getCartForUser(String userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO addToCart(String userId, String foodItemId, Integer quantity, FoodItemDTO swiggyFood) {
        Cart cart = getOrCreateCart(userId);
        FoodItem foodItem = null;

        // 1. Identify food item (Local DB vs Swiggy Sync)
        if (foodItemId != null && !foodItemId.isEmpty() && !foodItemId.equalsIgnoreCase("null")) {
            foodItem = foodItemRepository.findById(foodItemId).orElse(null);
            if (foodItem == null) {
                // maybe it's the externalId
                foodItem = foodItemRepository.findByExternalId(foodItemId).orElse(null);
            }
        }

        // 2. If still not found, try lazy sync if swiggyFood is provided
        if (foodItem == null && swiggyFood != null && swiggyFood.getExternalId() != null) {
            foodItem = syncSwiggyItem(swiggyFood);
        }

        if (foodItem == null) {
            throw new ResourceNotFoundException("Food item could not be identified or synced");
        }

        final String finalFoodId = foodItem.getId();
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getFoodItem().getId().equals(finalFoodId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder().foodItem(foodItem).quantity(quantity).build();
            cart.getItems().add(newItem);
        }

        return mapToDTO(cartRepository.save(cart));
    }

    private FoodItem syncSwiggyItem(FoodItemDTO dto) {
        // Find or Create Restaurant
        Restaurant restaurant = restaurantRepository.findByExternalId(dto.getRestaurantId().toString())
                .orElseGet(() -> {
                    Restaurant newR = Restaurant.builder()
                            .name("Swiggy Restaurant " + dto.getRestaurantId())
                            .externalId(dto.getRestaurantId().toString())
                            .imageUrl(dto.getImageUrl())
                            .location("Swiggy Location")
                            .build();
                    return restaurantRepository.save(newR);
                });

        // Find or Create Food Item
        return foodItemRepository.findByExternalId(dto.getExternalId())
                .orElseGet(() -> {
                    FoodItem newF = FoodItem.builder()
                            .name(dto.getName())
                            .description(dto.getDescription())
                            .price(dto.getPrice())
                            .imageUrl(dto.getImageUrl())
                            .externalId(dto.getExternalId())
                            .restaurant(restaurant)
                            .build();
                    return foodItemRepository.save(newF);
                });
    }

    @Override
    public CartDTO updateCartItem(String userId, String cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream().filter(ci -> ci.getId().equals(cartItemId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));
        
        item.setQuantity(quantity);
        return mapToDTO(cartRepository.save(cart));
    }

    @Override
    public void removeCartItem(String userId, String cartItemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(ci -> ci.getId().equals(cartItemId));
        cartRepository.save(cart);
    }

    @Override
    public void clearCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            Cart newCart = Cart.builder().user(user).items(new ArrayList<>()).build();
            return cartRepository.save(newCart);
        });
    }

    private CartDTO mapToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        List<CartItemDTO> itemDTOs = cart.getItems().stream().map(ci -> {
            CartItemDTO cid = new CartItemDTO();
            cid.setId(ci.getId());
            cid.setQuantity(ci.getQuantity());
            
            FoodItemDTO fid = new FoodItemDTO();
            fid.setId(ci.getFoodItem().getId());
            fid.setName(ci.getFoodItem().getName());
            fid.setPrice(ci.getFoodItem().getPrice());
            fid.setImageUrl(ci.getFoodItem().getImageUrl());
            cid.setFoodItem(fid);
            return cid;
        }).collect(Collectors.toList());
        dto.setItems(itemDTOs);
        return dto;
    }
}
