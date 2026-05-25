package com.foodordering.service.impl;

import com.foodordering.dto.FoodItemDTO;
import com.foodordering.dto.OrderDTO;
import com.foodordering.dto.OrderItemDTO;
import com.foodordering.dto.PlaceOrderRequest;
import com.foodordering.exception.BadRequestException;
import com.foodordering.exception.CartEmptyException;
import com.foodordering.exception.OrderNotFoundException;
import com.foodordering.model.Cart;
import com.foodordering.model.Order;
import com.foodordering.model.OrderItem;
import com.foodordering.model.OrderStatus;
import com.foodordering.repository.CartRepository;
import com.foodordering.repository.OrderRepository;
import com.foodordering.service.EmailService;
import com.foodordering.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final EmailService emailService;

    @Override
    public OrderDTO placeOrder(String userId, PlaceOrderRequest request) {
        log.info("Placing order for user: {}, payment: {}", userId, request.getPaymentMethod());
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new CartEmptyException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new CartEmptyException("Cart is empty");
        }

        double totalAmount = cart.getItems().stream()
                .mapToDouble(item -> item.getFoodItem().getPrice() * item.getQuantity())
                .sum();

        Order order = Order.builder()
                .user(cart.getUser())
                .totalAmount(totalAmount)
                .status(OrderStatus.WAITING_CONFIRMATION)
                .paymentMethod(request.getPaymentMethod())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryPhoneNumber(request.getDeliveryPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(ci -> OrderItem.builder()
                .foodItem(ci.getFoodItem())
                .quantity(ci.getQuantity())
                .price(ci.getFoodItem().getPrice())
                .build()).collect(Collectors.toList());

        order.setItems(orderItems);

        // Save order and clear cart
        Order savedOrder = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order placed successfully (waiting for confirmation): {}", savedOrder.getId());

        // Note: Email will be sent after payment verification/COD selection.

        return mapToDTO(savedOrder);
    }

    @Override
    public OrderDTO cancelOrder(String orderId, String userId) {
        log.info("Cancelling order: {} for user: {}", orderId, userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Only orders with status PLACED can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        log.info("Order cancelled successfully: {}", orderId);

        // Send cancellation email
        emailService.sendOrderCancellationEmail(
                savedOrder.getUser().getEmail(),
                savedOrder.getUser().getName(),
                savedOrder.getId(),
                savedOrder.getTotalAmount()
        );

        return mapToDTO(savedOrder);
    }

    @Override
    public List<OrderDTO> getUserOrders(String userId) {
        log.info("Fetching orders for user: {}", userId);
        return orderRepository.findByUserId(userId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrderById(String id) {
        return mapToDTO(orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException("Order not found")));
    }

    public OrderDTO acceptOrder(String orderId) {
        log.info("Admin accepting order: {}", orderId);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if (order.getStatus() != OrderStatus.WAITING_CONFIRMATION) {
            throw new BadRequestException("Only orders waiting for confirmation can be accepted");
        }

        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setStatus(OrderStatus.PREPARING);
        } else {
            order.setStatus(OrderStatus.ACCEPTED);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        emailService.sendOrderConfirmationEmail(
            savedOrder.getUser().getEmail(),
            savedOrder.getUser().getName(),
            savedOrder.getId(),
            savedOrder.getTotalAmount()
        );
        
        return mapToDTO(savedOrder);
    }

    public OrderDTO rejectOrder(String orderId) {
        log.info("Admin rejecting order: {}", orderId);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if (order.getStatus() != OrderStatus.WAITING_CONFIRMATION) {
            throw new BadRequestException("Only orders waiting for confirmation can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);
        Order savedOrder = orderRepository.save(order);

        // Optionally send a rejection email
        emailService.sendOrderCancellationEmail(
            savedOrder.getUser().getEmail(),
            savedOrder.getUser().getName(),
            savedOrder.getId(),
            savedOrder.getTotalAmount()
        );

        return mapToDTO(savedOrder);
    }

    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setRazorpayOrderId(order.getRazorpayOrderId());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setDeliveryPhoneNumber(order.getDeliveryPhoneNumber());
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDto = new OrderItemDTO();
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPrice(item.getPrice());
                
                if (item.getFoodItem() != null) {
                    FoodItemDTO foodDto = new FoodItemDTO();
                    foodDto.setId(item.getFoodItem().getId());
                    foodDto.setName(item.getFoodItem().getName());
                    itemDto.setFoodItem(foodDto);
                }
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
