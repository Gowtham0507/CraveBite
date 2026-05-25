package com.foodordering.service;

import com.foodordering.dto.OrderDTO;
import com.foodordering.dto.PaymentVerificationRequest;
import com.foodordering.exception.BadRequestException;
import com.foodordering.exception.OrderNotFoundException;
import com.foodordering.model.Order;
import com.foodordering.model.OrderStatus;
import com.foodordering.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public Map<String, String> createRazorpayOrder(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Order must be accepted by admin before payment");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("amount", Math.round(order.getTotalAmount() * 100)); // amount in paise
            options.put("currency", "INR");
            options.put("receipt", orderId);

            com.razorpay.Order razorpayOrder = client.orders.create(options);

            String rzpOrderId = razorpayOrder.get("id");
            order.setRazorpayOrderId(rzpOrderId);
            order.setPaymentStatus("PENDING");
            order.setPaymentMethod("ONLINE");
            orderRepository.save(order);

            Map<String, String> response = new HashMap<>();
            response.put("razorpayOrderId", rzpOrderId);
            response.put("key", razorpayKeyId);
            response.put("amount", String.valueOf(Math.round(order.getTotalAmount() * 100)));
            return response;
        } catch (Exception e) {
            log.error("Error creating razorpay order", e);
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    public OrderDTO verifyPayment(PaymentVerificationRequest request) {
        Order order = orderRepository.findById(request.getOrderId()).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                order.setPaymentStatus("COMPLETED");
                order.setStatus(OrderStatus.PREPARING);
                orderRepository.save(order);

                // Send email
                emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order.getUser().getName(), order.getId(), order.getTotalAmount());
                
                return mapToDTO(order);
            } else {
                order.setPaymentStatus("FAILED");
                orderRepository.save(order);
                throw new BadRequestException("Payment verification failed");
            }
        } catch (Exception e) {
            log.error("Error verifying payment", e);
            throw new BadRequestException("Payment verification error");
        }
    }

    public OrderDTO processCOD(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Order must be accepted by admin before payment");
        }

        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING"); // Will be paid on delivery
        order.setStatus(OrderStatus.PREPARING);
        orderRepository.save(order);

        // Send email
        emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order.getUser().getName(), order.getId(), order.getTotalAmount());

        return mapToDTO(order);
    }

    public OrderDTO mockSuccess(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("Order must be accepted by admin before payment");
        }

        order.setPaymentStatus("COMPLETED");
        order.setStatus(OrderStatus.PREPARING);
        orderRepository.save(order);

        // Send email
        emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order.getUser().getName(), order.getId(), order.getTotalAmount());

        return mapToDTO(order);
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
        return dto;
    }
}
