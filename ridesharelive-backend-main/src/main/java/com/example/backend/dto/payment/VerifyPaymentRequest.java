package com.example.backend.dto.payment;

import lombok.Data;

@Data
public class VerifyPaymentRequest {
    private String orderId;
    private String paymentId;
    private String signature;
    private String paymentMode;
}
