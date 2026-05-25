package com.foodordering.service;

import com.foodordering.dto.CartDTO;
import com.foodordering.dto.FoodItemDTO;

public interface CartService {
    CartDTO getCartForUser(String userId);
    CartDTO addToCart(String userId, String foodItemId, Integer quantity, FoodItemDTO swiggyFood);
    CartDTO updateCartItem(String userId, String cartItemId, Integer quantity);
    void removeCartItem(String userId, String cartItemId);
    void clearCart(String userId);
}
