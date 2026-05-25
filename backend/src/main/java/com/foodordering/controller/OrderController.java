package com.foodordering.controller;

import com.foodordering.dto.OrderDTO;
import com.foodordering.dto.PlaceOrderRequest;
import com.foodordering.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import com.foodordering.model.User;
import com.foodordering.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private String getUserId(Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(@RequestBody @Valid PlaceOrderRequest request, Authentication auth) {
        return ResponseEntity.ok(orderService.placeOrder(getUserId(auth), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getUserOrders(getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(orderService.cancelOrder(id, getUserId(auth)));
    }

    @PutMapping("/accept/{id}")
    public ResponseEntity<OrderDTO> acceptOrder(@PathVariable String id) {
        // Normally you'd verify if user is admin here (e.g. via @PreAuthorize or extracting roles)
        return ResponseEntity.ok(orderService.acceptOrder(id));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<OrderDTO> rejectOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.rejectOrder(id));
    }
}
