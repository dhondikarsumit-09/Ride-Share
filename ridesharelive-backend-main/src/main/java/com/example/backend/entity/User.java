package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Column(length = 20)
    private String role;

    @Column(length = 80)
    private String city;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Boolean blocked = false;

    @Builder.Default
    private Boolean online = false;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    private Instant lastActiveAt;

    @Column(length = 30)
    private String kycStatus;

    @Column(length = 80)
    private String vehicleLabel;

    @Column(length = 80)
    private String assignedZone;

    private Double latitude;

    private Double longitude;

    @Column(precision = 3, scale = 2)
    private BigDecimal ratingAverage;
}
