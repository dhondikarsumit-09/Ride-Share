package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.AdminZone;

public interface AdminZoneRepository extends JpaRepository<AdminZone, Long> {
    Optional<AdminZone> findByNameIgnoreCase(String name);
}
