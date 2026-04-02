package com.example.backend.entity;

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
@Table(name = "admin_zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(length = 80)
    private String city;

    @Column(length = 30)
    private String demandLevel;

    @Builder.Default
    private Boolean serviceable = true;

    @Builder.Default
    private Boolean ruralRouteSupport = true;

    @Builder.Default
    private Integer activeDrivers = 0;

    @Builder.Default
    private Integer ongoingRides = 0;

    @Column(length = 800)
    private String blockedRoads;

    @Column(length = 120)
    private String boundaryLabel;

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
