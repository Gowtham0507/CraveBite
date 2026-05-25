package com.foodordering.controller;

import com.foodordering.dto.OrderDTO;
import com.foodordering.dto.PaymentVerificationRequest;
import com.foodordering.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<Map<String, String>> createPaymentOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }

    @PostMapping("/verify")
    public ResponseEntity<OrderDTO> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @PostMapping("/cod/{orderId}")
    public ResponseEntity<OrderDTO> processCOD(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.processCOD(orderId));
    }

    @PostMapping("/mock-success/{orderId}")
    public ResponseEntity<OrderDTO> mockPaymentSuccess(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.mockSuccess(orderId));
    }
}
