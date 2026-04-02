package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminOverviewResponse(
        OverviewKpis kpis,
        List<TrendPoint> ridesPerHour,
        List<TrendPoint> revenueTrend,
        List<TrendPoint> driverActivityTrend,
        List<TrendPoint> rideCompletionTrend,
        List<ZoneHeatmapPoint> zoneDemandHeatmap,
        List<LiveAlert> liveAlerts,
        Instant generatedAt
) {
    public record OverviewKpis(
            long totalUsers,
            long totalDrivers,
            long activeDrivers,
            long ongoingRides,
            long completedToday,
            BigDecimal revenueToday,
            double cancelledPercentage,
            long pendingComplaints
    ) {
    }

    public record TrendPoint(String label, double value) {
    }

    public record ZoneHeatmapPoint(
            Long zoneId,
            String zoneName,
            String city,
            String demandLevel,
            int activeDrivers,
            int ongoingRides
    ) {
    }

    public record LiveAlert(
            String id,
            String type,
            String severity,
            String title,
            String subtitle,
            Instant createdAt
    ) {
    }
}
