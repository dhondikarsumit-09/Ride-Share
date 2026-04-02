package com.example.backend.dto.payment;

import lombok.Data;

@Data
public class CreatePaymentSessionRequest {
    private Integer amountInInr;
    private String rideSummary;
    private String paymentMode;
}
