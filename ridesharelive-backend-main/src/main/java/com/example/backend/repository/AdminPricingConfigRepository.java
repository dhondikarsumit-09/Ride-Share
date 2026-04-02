package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.AdminPricingConfig;

public interface AdminPricingConfigRepository extends JpaRepository<AdminPricingConfig, Long> {
    Optional<AdminPricingConfig> findByRideTypeIgnoreCase(String rideType);
}
