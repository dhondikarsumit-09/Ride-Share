package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.AdminComplaint;

public interface AdminComplaintRepository extends JpaRepository<AdminComplaint, Long> {
}
