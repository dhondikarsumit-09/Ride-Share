package com.example.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PaymentService {
    private static final String MOCK_PROVIDER = "MOCK";
    private static final String RAZORPAY_PROVIDER = "RAZORPAY";
    private static final String LOCAL_SESSION_PREFIX = "local_payment_";
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final Map<String, Map<String, Object>> verifiedPaymentStore = new ConcurrentHashMap<>();
    private final RestClient razorpayClient = RestClient.create("https://api.razorpay.com/v1");

    @Value("${app.payment.currency:INR}")
    private String currency;

    @Value("${app.payment.razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${app.payment.razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${app.payment.checkout-name:RideShare Live}")
    private String checkoutName;

    public Map<String, Object> createPaymentSession(
            Integer amountInInr,
            String rideSummary,
            Long riderId,
            String paymentMode
    ) {
        if (amountInInr == null || amountInInr <= 0) {
            throw new IllegalArgumentException("amountInInr must be a positive number.");
        }

        String normalizedPaymentMode = normalizePaymentMode(paymentMode);
        if (!isOnlinePaymentMode(normalizedPaymentMode)) {
            throw new IllegalArgumentException("Online payment mode is required to create a payment session.");
        }

        long amountInMinorUnits = amountInInr.longValue() * 100L;
        String normalizedCurrency = normalizeCurrency(currency);
        String safeRideSummary = rideSummary == null ? "" : rideSummary.trim();

        if (isRazorpayConfigured()) {
            return createRazorpayOrder(amountInMinorUnits, normalizedCurrency, safeRideSummary, riderId, normalizedPaymentMode);
        }

        return createMockPaymentSession(amountInMinorUnits, normalizedCurrency, safeRideSummary, normalizedPaymentMode);
    }

    public Map<String, Object> verifyPaymentSession(String paymentReference) {
        if (paymentReference == null || paymentReference.isBlank()) {
            throw new IllegalArgumentException("paymentReference is required.");
        }

        Map<String, Object> record = verifiedPaymentStore.get(paymentReference.trim());
        if (record == null) {
            throw new IllegalArgumentException("Payment session is not verified.");
        }
        return new LinkedHashMap<>(record);
    }

    public Map<String, Object> verifyRazorpayPayment(
            String orderId,
            String paymentId,
            String signature,
            String paymentMode
    ) {
        String normalizedOrderId = normalizeRequired(orderId, "orderId");
        String normalizedPaymentId = normalizeRequired(paymentId, "paymentId");
        String normalizedSignature = normalizeRequired(signature, "signature");
        String normalizedPaymentMode = normalizePaymentMode(paymentMode);

        Map<String, Object> existingOrder = verifiedPaymentStore.get(normalizedOrderId);
        if (existingOrder != null && MOCK_PROVIDER.equals(existingOrder.get("provider"))) {
            Map<String, Object> verifiedMock = new LinkedHashMap<>(existingOrder);
            verifiedPaymentStore.put(normalizedPaymentId, verifiedMock);
            return buildVerificationResponse(normalizedOrderId, normalizedPaymentId, verifiedMock);
        }

        if (!isRazorpayConfigured()) {
            throw new IllegalStateException("Razorpay is not configured.");
        }

        String expectedSignature = computeRazorpaySignature(normalizedOrderId, normalizedPaymentId);
        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                normalizedSignature.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new IllegalArgumentException("Invalid Razorpay signature.");
        }

        Map<String, Object> verified = new LinkedHashMap<>(existingOrder == null ? Map.of() : existingOrder);
        verified.put("provider", RAZORPAY_PROVIDER);
        verified.put("orderId", normalizedOrderId);
        verified.put("paymentId", normalizedPaymentId);
        verified.put("sessionId", normalizedPaymentId);
        verified.put("paid", true);
        verified.put("paymentStatus", "paid");
        verified.put("paymentMode", normalizedPaymentMode);

        verifiedPaymentStore.put(normalizedOrderId, verified);
        verifiedPaymentStore.put(normalizedPaymentId, verified);
        return buildVerificationResponse(normalizedOrderId, normalizedPaymentId, verified);
    }

    private Map<String, Object> createRazorpayOrder(
            long amountInMinorUnits,
            String normalizedCurrency,
            String rideSummary,
            Long riderId,
            String paymentMode
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("amount", amountInMinorUnits);
        payload.put("currency", normalizedCurrency);
        payload.put("receipt", buildReceipt());
        payload.put("notes", Map.of(
                "rideSummary", rideSummary,
                "riderId", riderId == null ? "" : String.valueOf(riderId),
                "paymentMode", paymentMode
        ));

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> razorpayOrder = razorpayClient.post()
                    .uri("/orders")
                    .headers(headers -> headers.setBasicAuth(razorpayKeyId, razorpayKeySecret))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            String orderId = razorpayOrder == null ? "" : String.valueOf(razorpayOrder.getOrDefault("id", "")).trim();
            if (orderId.isBlank()) {
                throw new IllegalStateException("Unable to create Razorpay order.");
            }

            Map<String, Object> record = new LinkedHashMap<>();
            record.put("provider", RAZORPAY_PROVIDER);
            record.put("orderId", orderId);
            record.put("paid", false);
            record.put("paymentStatus", "created");
            record.put("amountTotalMinor", amountInMinorUnits);
            record.put("currency", normalizedCurrency);
            record.put("paymentMode", paymentMode);
            verifiedPaymentStore.put(orderId, record);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("provider", RAZORPAY_PROVIDER);
            response.put("orderId", orderId);
            response.put("amountMinor", amountInMinorUnits);
            response.put("currency", normalizedCurrency);
            response.put("keyId", razorpayKeyId);
            response.put("name", checkoutName);
            response.put("description", rideSummary.isBlank() ? "Ride payment" : rideSummary);
            response.put("paymentMode", paymentMode);
            response.put("isMock", false);
            return response;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create Razorpay order.");
        }
    }

    private Map<String, Object> createMockPaymentSession(
            long amountInMinorUnits,
            String normalizedCurrency,
            String rideSummary,
            String paymentMode
    ) {
        String localSessionId = LOCAL_SESSION_PREFIX + UUID.randomUUID();

        Map<String, Object> record = new LinkedHashMap<>();
        record.put("provider", MOCK_PROVIDER);
        record.put("orderId", localSessionId);
        record.put("paymentId", localSessionId);
        record.put("sessionId", localSessionId);
        record.put("paid", true);
        record.put("paymentStatus", "paid");
        record.put("amountTotalMinor", amountInMinorUnits);
        record.put("currency", normalizedCurrency);
        record.put("paymentMode", paymentMode);
        verifiedPaymentStore.put(localSessionId, record);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provider", MOCK_PROVIDER);
        response.put("orderId", localSessionId);
        response.put("paymentId", localSessionId);
        response.put("sessionId", localSessionId);
        response.put("amountMinor", amountInMinorUnits);
        response.put("currency", normalizedCurrency);
        response.put("name", checkoutName);
        response.put("description", rideSummary.isBlank() ? "Mock ride payment" : rideSummary);
        response.put("paymentMode", paymentMode);
        response.put("paymentStatus", "paid");
        response.put("isMock", true);
        return response;
    }

    private static Map<String, Object> buildVerificationResponse(
            String orderId,
            String paymentId,
            Map<String, Object> verifiedRecord
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("verified", true);
        response.put("provider", verifiedRecord.getOrDefault("provider", ""));
        response.put("orderId", orderId);
        response.put("paymentId", paymentId);
        response.put("paymentReference", paymentId);
        response.put("paymentStatus", verifiedRecord.getOrDefault("paymentStatus", "paid"));
        response.put("paymentMode", verifiedRecord.getOrDefault("paymentMode", ""));
        return response;
    }

    private static String normalizeRequired(String value, String fieldName) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
        return normalized;
    }

    private static String normalizeCurrency(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        return normalized.isBlank() ? "INR" : normalized;
    }

    private static String normalizePaymentMode(String paymentMode) {
        if (paymentMode == null || paymentMode.isBlank()) {
            return "CARD";
        }
        String normalized = paymentMode.trim().toUpperCase(Locale.ROOT);
        if ("UPI".equals(normalized) || "WALLET".equals(normalized) || "CARD".equals(normalized)) {
            return normalized;
        }
        return "CARD";
    }

    private static boolean isOnlinePaymentMode(String paymentMode) {
        return "CARD".equals(paymentMode) || "UPI".equals(paymentMode) || "WALLET".equals(paymentMode);
    }

    private boolean isRazorpayConfigured() {
        return razorpayKeyId != null
                && !razorpayKeyId.isBlank()
                && razorpayKeySecret != null
                && !razorpayKeySecret.isBlank();
    }

    private static String buildReceipt() {
        return ("ride_" + UUID.randomUUID()).replace("-", "").substring(0, 20);
    }

    private String computeRazorpaySignature(String orderId, String paymentId) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] digest = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to verify Razorpay signature.");
        }
    }
}
