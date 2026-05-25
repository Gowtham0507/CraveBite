package com.foodordering.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private String orderId; // internal order id
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}
