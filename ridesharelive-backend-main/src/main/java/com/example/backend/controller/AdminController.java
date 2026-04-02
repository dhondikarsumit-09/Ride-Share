package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.admin.AdminActionRequest;
import com.example.backend.dto.admin.AdminAlertsResponse;
import com.example.backend.dto.admin.AdminAnalyticsResponse;
import com.example.backend.dto.admin.AdminComplaintsResponse;
import com.example.backend.dto.admin.AdminDriversResponse;
import com.example.backend.dto.admin.AdminLiveMapResponse;
import com.example.backend.dto.admin.AdminOverviewResponse;
import com.example.backend.dto.admin.AdminPaymentsResponse;
import com.example.backend.dto.admin.AdminPricingResponse;
import com.example.backend.dto.admin.AdminPricingUpdateRequest;
import com.example.backend.dto.admin.AdminRidesResponse;
import com.example.backend.dto.admin.AdminSettingsResponse;
import com.example.backend.dto.admin.AdminSettingsUpdateRequest;
import com.example.backend.dto.admin.AdminUsersResponse;
import com.example.backend.dto.admin.AdminZoneUpdateRequest;
import com.example.backend.dto.admin.AdminZonesResponse;
import com.example.backend.service.AdminOpsService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminOpsService adminOpsService;

    public AdminController(AdminOpsService adminOpsService) {
        this.adminOpsService = adminOpsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewResponse> overview() {
        return ResponseEntity.ok(adminOpsService.getOverview());
    }

    @GetMapping("/users")
    public ResponseEntity<AdminUsersResponse> users(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String city,
            @RequestParam(defaultValue = "") String state
    ) {
        return ResponseEntity.ok(adminOpsService.getUsers(search, city, state));
    }

    @PatchMapping("/users/{userId}")
    public ResponseEntity<AdminUsersResponse.UserRow> updateUser(
            @PathVariable Long userId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.handleUserAction(userId, request));
    }

    @GetMapping("/users/{userId}/rides")
    public ResponseEntity<AdminRidesResponse> userTrips(@PathVariable Long userId) {
        return ResponseEntity.ok(adminOpsService.getUserTrips(userId));
    }

    @GetMapping("/drivers")
    public ResponseEntity<AdminDriversResponse> drivers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String zone
    ) {
        return ResponseEntity.ok(adminOpsService.getDrivers(search, status, zone));
    }

    @PatchMapping("/drivers/{driverId}")
    public ResponseEntity<AdminDriversResponse.DriverRow> updateDriver(
            @PathVariable Long driverId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.handleDriverAction(driverId, request));
    }

    @PostMapping("/drivers/{driverId}/approve")
    public ResponseEntity<AdminDriversResponse.DriverRow> approveDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(adminOpsService.handleDriverAction(driverId, new AdminActionRequest("APPROVE", null, null, null, null)));
    }

    @PostMapping("/drivers/{driverId}/reject")
    public ResponseEntity<AdminDriversResponse.DriverRow> rejectDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(adminOpsService.handleDriverAction(driverId, new AdminActionRequest("REJECT", null, null, null, null)));
    }

    @GetMapping("/rides")
    public ResponseEntity<AdminRidesResponse> rides(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String paymentMode,
            @RequestParam(defaultValue = "") String search
    ) {
        return ResponseEntity.ok(adminOpsService.getRides(status, paymentMode, search));
    }

    @PatchMapping("/rides/{rideId}")
    public ResponseEntity<AdminRidesResponse.RideRow> updateRide(
            @PathVariable Long rideId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.handleRideAction(rideId, request));
    }

    @GetMapping("/pricing")
    public ResponseEntity<AdminPricingResponse> pricing() {
        return ResponseEntity.ok(adminOpsService.getPricing());
    }

    @PutMapping("/pricing")
    public ResponseEntity<AdminPricingResponse> updatePricing(@RequestBody AdminPricingUpdateRequest request) {
        return ResponseEntity.ok(adminOpsService.updatePricing(request));
    }

    @GetMapping("/complaints")
    public ResponseEntity<AdminComplaintsResponse> complaints(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String severity,
            @RequestParam(defaultValue = "") String search
    ) {
        return ResponseEntity.ok(adminOpsService.getComplaints(status, severity, search));
    }

    @PatchMapping("/complaints/{complaintId}")
    public ResponseEntity<AdminComplaintsResponse.ComplaintRow> updateComplaint(
            @PathVariable Long complaintId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.handleComplaintAction(complaintId, request));
    }

    @GetMapping("/payments")
    public ResponseEntity<AdminPaymentsResponse> payments(
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "") String mode
    ) {
        return ResponseEntity.ok(adminOpsService.getPayments(status, mode));
    }

    @PostMapping("/payments/{rideId}")
    public ResponseEntity<AdminPaymentsResponse.PaymentRow> updatePayment(
            @PathVariable Long rideId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.handlePaymentAction(rideId, request));
    }

    @GetMapping("/zones")
    public ResponseEntity<AdminZonesResponse> zones() {
        return ResponseEntity.ok(adminOpsService.getZones());
    }

    @PutMapping("/zones/{zoneId}")
    public ResponseEntity<AdminZonesResponse.ZoneRow> updateZone(
            @PathVariable Long zoneId,
            @RequestBody AdminZoneUpdateRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.updateZone(zoneId, request));
    }

    @GetMapping("/alerts")
    public ResponseEntity<AdminAlertsResponse> alerts() {
        return ResponseEntity.ok(adminOpsService.getAlerts());
    }

    @PatchMapping("/alerts/{alertId}/acknowledge")
    public ResponseEntity<AdminAlertsResponse.AlertRow> acknowledgeAlert(
            @PathVariable String alertId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        return ResponseEntity.ok(adminOpsService.acknowledgeAlert(alertId, request == null ? null : request.status()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> analytics() {
        return ResponseEntity.ok(adminOpsService.getAnalytics());
    }

    @GetMapping("/live-map")
    public ResponseEntity<AdminLiveMapResponse> liveMap() {
        return ResponseEntity.ok(adminOpsService.getLiveMap());
    }

    @GetMapping("/settings")
    public ResponseEntity<AdminSettingsResponse> settings() {
        return ResponseEntity.ok(adminOpsService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<AdminSettingsResponse> updateSettings(@RequestBody AdminSettingsUpdateRequest request) {
        return ResponseEntity.ok(adminOpsService.updateSettings(request));
    }
}
