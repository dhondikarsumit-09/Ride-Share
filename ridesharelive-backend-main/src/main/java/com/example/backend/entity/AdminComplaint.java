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
@Table(name = "admin_complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminComplaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long driverId;

    private Long rideId;

    @Column(length = 40, nullable = false)
    private String category;

    @Column(length = 40, nullable = false)
    private String severity;

    @Column(length = 40, nullable = false)
    private String status;

    @Column(length = 80)
    private String city;

    @Column(length = 240, nullable = false)
    private String subject;

    @Column(length = 800)
    private String description;

    @Column(length = 80)
    private String assignedTo;

    @Column(length = 80)
    private String resolutionCode;

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
