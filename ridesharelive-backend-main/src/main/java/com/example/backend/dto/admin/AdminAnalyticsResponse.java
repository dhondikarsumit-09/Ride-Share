package com.example.backend.dto.admin;

import java.util.List;

public record AdminAnalyticsResponse(
        List<AdminOverviewResponse.TrendPoint> ridesByHour,
        List<AdminOverviewResponse.TrendPoint> dailyRevenue,
        List<AdminOverviewResponse.ZoneHeatmapPoint> cityDemand,
        List<AdminOverviewResponse.TrendPoint> cancellationTrend,
        List<AdminOverviewResponse.TrendPoint> driverOnlineTrend
) {
}
