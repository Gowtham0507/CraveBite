package com.foodordering.service;

import com.foodordering.dto.OrderDTO;

import java.util.List;

import com.foodordering.dto.PlaceOrderRequest;

public interface OrderService {
    OrderDTO placeOrder(String userId, PlaceOrderRequest request);
    List<OrderDTO> getUserOrders(String userId);
    List<OrderDTO> getAllOrders();
    OrderDTO getOrderById(String id);
    OrderDTO cancelOrder(String orderId, String userId);
    OrderDTO acceptOrder(String orderId);
    OrderDTO rejectOrder(String orderId);
}
