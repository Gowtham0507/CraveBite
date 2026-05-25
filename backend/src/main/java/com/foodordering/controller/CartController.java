package com.foodordering.controller;

import com.foodordering.dto.CartDTO;
import com.foodordering.dto.FoodItemDTO;
import com.foodordering.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import com.foodordering.model.User;
import com.foodordering.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private String getUserId(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCartForUser(getUserId(auth)));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(Authentication auth, @RequestBody FoodItemDTO foodItemDTO, @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(getUserId(auth), foodItemDTO.getId(), quantity, foodItemDTO));
    }

    @PutMapping("/update")
    public ResponseEntity<CartDTO> updateCartItem(Authentication auth, @RequestParam String cartItemId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(getUserId(auth), cartItemId, quantity));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeCartItem(Authentication auth, @RequestParam String cartItemId) {
        cartService.removeCartItem(getUserId(auth), cartItemId);
        return ResponseEntity.ok().build();
    }
}
