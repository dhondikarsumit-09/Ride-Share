package com.example.backend.entity;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admin_pricing_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPricingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String rideType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseFare;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal perKmRate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal perMinuteRate;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal ruralMultiplier;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal cityTierMultiplier;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal nightChargeMultiplier;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal peakMultiplier;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal maxSurgeMultiplier;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal tollFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal bookingFee;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
