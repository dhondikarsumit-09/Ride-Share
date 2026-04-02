package com.example.backend.service;

import java.time.LocalTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.entity.Ride;
import com.example.backend.entity.User;
import com.example.backend.repository.RideRepository;
import com.example.backend.repository.UserRepository;

@Service
public class RideService {

    private static final int MAX_WAITING_CHARGE_INR = 20;
    private static final int FREE_WAITING_MINUTES = 3;
    private static final double WAITING_CHARGE_PER_MINUTE_INR = 1.0;
    private static final Map<String, FareProfile> FARE_PROFILES = Map.of(
            "BIKE", new FareProfile("bike", 12.0, 6.3, 8.4, 0.22, 1.00),
            "AUTO", new FareProfile("auto", 20.0, 10.0, 12.0, 0.50, 1.00),
            "CAR", new FareProfile("car", 50.0, 12.0, 15.0, 1.00, 1.00),
            "COMFORT", new FareProfile("car", 50.0, 12.0, 15.0, 1.00, 1.08),
            "PREMIUM", new FareProfile("car", 50.0, 12.0, 15.0, 1.00, 1.18),
            "XL", new FareProfile("car", 50.0, 12.0, 15.0, 1.00, 1.30),
            "ECONOMY", new FareProfile("auto", 20.0, 10.0, 12.0, 0.50, 1.00),
            "MINI", new FareProfile("auto", 20.0, 10.0, 12.0, 0.50, 0.96),
            "SEDAN", new FareProfile("car", 50.0, 12.0, 15.0, 1.00, 1.10)
    );
    private static final Map<String, Integer> FLEXI_FARE_INCREMENTS = Map.of(
            "standard", 0,
            "+15", 15,
            "+30", 30,
            "+50", 50
    );

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private DriverLocationCacheService driverLocationCacheService;

    @Autowired
    private RouteEstimationService routeEstimationService;

    public Ride bookRide(Ride ride) {
        normalizePaymentState(ride);
        if (ride.getCreatedAt() == null) {
            ride.setCreatedAt(Instant.now());
        }
        Ride savedRide = rideRepository.save(ride);
        notificationService.notifyRideEvent(savedRide);
        return savedRide;
    }

    public Ride updateStatus(Long rideId, Ride.Status status, String driverId, String otp) {
        Ride ride = rideRepository.findById(rideId).orElseThrow();
        if (ride.getStatus() == Ride.Status.COMPLETED || ride.getStatus() == Ride.Status.CANCELLED) {
            throw new IllegalArgumentException("Ride is already closed.");
        }

        boolean otpGenerated = false;

        if (status == Ride.Status.ACCEPTED && driverId != null) {
            ride.setDriverId(Long.valueOf(driverId.trim()));
            if (ride.getAcceptedAt() == null) {
                ride.setAcceptedAt(Instant.now());
            }
            if (ride.getStartOtp() == null || ride.getStartOtp().isBlank()) {
                ride.setStartOtp(generateOtp());
                otpGenerated = true;
            }
            if (ride.getEndOtp() == null || ride.getEndOtp().isBlank()) {
                ride.setEndOtp(generateOtp());
                otpGenerated = true;
            }
        } else if (status == Ride.Status.PICKED) {
            if (ride.getStatus() != Ride.Status.ACCEPTED) {
                throw new IllegalArgumentException("Ride must be accepted before pickup.");
            }
            validateOtp(ride.getStartOtp(), otp, "Invalid start OTP.");
        } else if (status == Ride.Status.COMPLETED) {
            if (ride.getStatus() != Ride.Status.PICKED) {
                throw new IllegalArgumentException("Ride must be picked before completion.");
            }
            validateOtp(ride.getEndOtp(), otp, "Invalid end OTP.");
        }

        ride.setStatus(status);
        Ride updatedRide = rideRepository.save(ride);
        if (status == Ride.Status.ACCEPTED && otpGenerated) {
            notificationService.sendRideOtpEmails(updatedRide);
        }
        notificationService.notifyRideEvent(updatedRide);
        return updatedRide;
    }

    public List<Ride> getRidesForUser(User user) {
        return rideRepository.findAll().stream()
                .filter(r -> (r.getRiderId() != null && r.getRiderId().equals(user.getId()))
                || (r.getDriverId() != null && r.getDriverId().equals(user.getId())))
                .map(this::enrichRideContacts)
                .toList();
    }

    public List<Ride> getRequestedRides() {
        return rideRepository.findAll().stream()
                .filter(r -> r.getStatus() != Ride.Status.COMPLETED && r.getStatus() != Ride.Status.CANCELLED)
                .map(this::enrichRideContacts)
                .toList();
    }

    public Ride getRideById(Long rideId) {
        return rideRepository.findById(rideId).map(this::enrichRideContacts).orElse(null);
    }

    public Ride submitFeedback(Long rideId, User user, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        Ride ride = rideRepository.findById(rideId).orElseThrow();
        if (ride.getStatus() != Ride.Status.COMPLETED) {
            throw new IllegalArgumentException("Feedback can only be submitted after ride completion.");
        }

        String role = (user.getRole() == null ? "" : user.getRole()).trim().toUpperCase(Locale.ROOT);
        String normalizedComment = comment == null ? "" : comment.trim();

        if ("DRIVER".equals(role)) {
            if (ride.getDriverId() == null || !ride.getDriverId().equals(user.getId())) {
                throw new IllegalArgumentException("Driver is not assigned to this ride.");
            }
            ride.setDriverRating(rating);
            ride.setDriverFeedback(normalizedComment);
        } else {
            if (ride.getRiderId() == null || !ride.getRiderId().equals(user.getId())) {
                throw new IllegalArgumentException("Rider does not own this ride.");
            }
            ride.setRiderRating(rating);
            ride.setRiderFeedback(normalizedComment);
        }

        return rideRepository.save(ride);
    }

    public Ride submitDriverLocation(Long rideId, User user, Double lat, Double lon) {
        if (lat == null || lon == null || !Double.isFinite(lat) || !Double.isFinite(lon)) {
            throw new IllegalArgumentException("Invalid coordinates.");
        }

        Ride ride = rideRepository.findById(rideId).orElseThrow();
        if (ride.getStatus() != Ride.Status.ACCEPTED && ride.getStatus() != Ride.Status.PICKED) {
            throw new IllegalArgumentException("Live location can only be updated for active rides.");
        }
        if (ride.getDriverId() == null || !ride.getDriverId().equals(user.getId())) {
            throw new IllegalArgumentException("Driver is not assigned to this ride.");
        }

        ride.setDriverLat(lat);
        ride.setDriverLon(lon);
        ride.setDriverLocationUpdatedAt(Instant.now());
        Ride savedRide = rideRepository.save(ride);
        try {
            driverLocationCacheService.upsertDriverLocation(user.getId(), lat, lon);
        } catch (Exception ignored) {
            // Keep ride flow resilient even when Redis is temporarily unavailable.
        }
        return savedRide;
    }

    public Ride cancelRide(Long rideId, User user, String reason) {
        Ride ride = rideRepository.findById(rideId).orElseThrow();
        if (ride.getStatus() == Ride.Status.COMPLETED || ride.getStatus() == Ride.Status.CANCELLED) {
            throw new IllegalArgumentException("Ride cannot be cancelled.");
        }

        String role = (user.getRole() == null ? "" : user.getRole()).trim().toUpperCase(Locale.ROOT);
        boolean isRider = ride.getRiderId() != null && ride.getRiderId().equals(user.getId());
        boolean isDriver = ride.getDriverId() != null && ride.getDriverId().equals(user.getId());
        if (!isRider && !isDriver) {
            throw new IllegalArgumentException("You are not allowed to cancel this ride.");
        }

        String cancelledBy = isDriver && "DRIVER".equals(role) ? "DRIVER" : "RIDER";
        double fee = calculateCancellationFee(ride, cancelledBy);

        String normalizedReason = reason == null ? "" : reason.trim();
        if (normalizedReason.isBlank()) {
            normalizedReason = cancelledBy.equals("DRIVER") ? "Driver cancelled the ride." : "Rider cancelled the ride.";
        }

        ride.setStatus(Ride.Status.CANCELLED);
        ride.setCancelledBy(cancelledBy);
        ride.setCancellationReason(normalizedReason);
        ride.setCancellationFee(fee);
        Ride cancelledRide = rideRepository.save(ride);
        notificationService.notifyRideEvent(cancelledRide);
        return cancelledRide;
    }

    public Map<String, Object> estimateRide(
            Double distanceKm,
            String rideType,
            Double pickupLat,
            Double pickupLon,
            Double dropLat,
            Double dropLon,
            String routePreference
    ) {
        if (distanceKm == null || !Double.isFinite(distanceKm) || distanceKm <= 0) {
            throw new IllegalArgumentException("distanceKm must be a positive number.");
        }

        String normalizedType = normalizeRideType(rideType);
        FareProfile fareProfile = FARE_PROFILES.getOrDefault(normalizedType, FARE_PROFILES.get("AUTO"));

        RouteEstimationService.RouteSnapshot route = routeEstimationService.resolveRoute(pickupLat, pickupLon, dropLat, dropLon, routePreference);
        if (route == null) {
            route = routeEstimationService.buildFallbackRoute(pickupLat, pickupLon, dropLat, dropLon, distanceKm);
        }

        double effectiveDistanceKm = route == null ? Math.max(0, distanceKm) : route.distanceKm();
        double effectiveDurationMinutes = route == null
                ? Math.max(4.0, (effectiveDistanceKm / speedForRideType(normalizedType)) * 60.0)
                : route.durationMin();
        FareBreakdown fareBreakdown = calculateFare(effectiveDistanceKm, effectiveDurationMinutes, fareProfile);

        int etaMin = Math.max(4, (int) Math.floor(effectiveDurationMinutes));
        int etaMax = Math.max(etaMin + 3, (int) Math.ceil(effectiveDurationMinutes * 1.12));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("distanceKm", roundOneDecimal(effectiveDistanceKm));
        payload.put("durationMinutes", roundOneDecimal(effectiveDurationMinutes));
        payload.put("rideType", normalizedType.toLowerCase(Locale.ROOT));
        payload.put("vehicleCategory", fareProfile.category());
        payload.put("estimatedFare", fareBreakdown.totalFare());
        payload.put("fareMin", fareBreakdown.totalFare());
        payload.put("fareMax", fareBreakdown.totalFare() + 50);
        payload.put("etaMinMinutes", etaMin);
        payload.put("etaMaxMinutes", etaMax);
        payload.put("baseFare", roundTwoDecimals(fareBreakdown.baseFare()));
        payload.put("distanceFare", roundTwoDecimals(fareBreakdown.distanceFare()));
        payload.put("timeFare", roundTwoDecimals(fareBreakdown.timeFare()));
        payload.put("waitingCharge", fareBreakdown.waitingCharge());
        payload.put("nightCharge", roundTwoDecimals(fareBreakdown.nightCharge()));
        payload.put("currency", "INR");
        payload.put("routeProvider", route == null ? "distance-only" : route.provider());
        payload.put("path", route == null ? List.of() : route.path());
        payload.put("flexiFares", buildFlexiFares(fareBreakdown.totalFare()));
        return payload;
    }

    private static String generateOtp() {
        int value = ThreadLocalRandom.current().nextInt(1000, 10000);
        return String.valueOf(value);
    }

    private Ride enrichRideContacts(Ride ride) {
        if (ride == null || ride.getRiderId() == null) {
            return ride;
        }

        userRepository.findById(ride.getRiderId()).ifPresent(rider -> {
            ride.setRiderName(rider.getName());
            ride.setRiderEmail(rider.getEmail());
        });
        return ride;
    }

    private static String normalizeRideType(String rideType) {
        if (rideType == null || rideType.isBlank()) {
            return "AUTO";
        }
        String normalized = rideType.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "BIKE" -> "BIKE";
            case "AUTO", "ECONOMY", "MINI" -> normalized;
            case "CAR", "COMFORT", "PREMIUM", "XL", "SEDAN" -> normalized;
            default -> "AUTO";
        };
    }

    private static double speedForRideType(String rideType) {
        return switch (rideType) {
            case "BIKE" -> 30;
            case "XL", "PREMIUM", "SEDAN", "CAR", "COMFORT" -> 24;
            default -> 26;
        };
    }

    private static FareBreakdown calculateFare(double distanceKm, double durationMinutes, FareProfile fareProfile) {
        double normalizedDistanceKm = Math.max(0.0, distanceKm);
        double normalizedDurationMinutes = Math.max(0.0, durationMinutes);

        double distanceFare = normalizedDistanceKm <= 7.0
                ? normalizedDistanceKm * fareProfile.distanceRate0To7()
                : (7.0 * fareProfile.distanceRate0To7()) + ((normalizedDistanceKm - 7.0) * fareProfile.distanceRateAbove7());
        double timeFare = normalizedDurationMinutes * fareProfile.timeRate();
        int waitingCharge = calculateWaitingCharge(normalizedDurationMinutes);
        double subtotal = (fareProfile.baseFare() + distanceFare + timeFare + waitingCharge) * fareProfile.multiplier();
        double nightCharge = isNightFareWindow() ? subtotal * 0.40 : 0.0;
        int totalFare = (int) Math.round(subtotal + nightCharge);

        return new FareBreakdown(
                fareProfile.baseFare(),
                distanceFare * fareProfile.multiplier(),
                timeFare * fareProfile.multiplier(),
                waitingCharge,
                nightCharge,
                Math.max(1, totalFare)
        );
    }

    private static int calculateWaitingCharge(double durationMinutes) {
        int waitMinutes = (int) Math.max(0, Math.floor(durationMinutes) - FREE_WAITING_MINUTES);
        return (int) Math.min(MAX_WAITING_CHARGE_INR, Math.round(waitMinutes * WAITING_CHARGE_PER_MINUTE_INR));
    }

    private static boolean isNightFareWindow() {
        int hour = LocalTime.now().getHour();
        return hour >= 23 || hour < 5;
    }

    private static List<Map<String, Object>> buildFlexiFares(int baseFare) {
        return FLEXI_FARE_INCREMENTS.entrySet().stream()
                .map(entry -> Map.<String, Object>of(
                        "label", entry.getKey().equals("standard") ? "Standard" : entry.getKey(),
                        "amount", baseFare + entry.getValue()))
                .toList();
    }

    private static double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static double roundTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static void validateOtp(String expectedOtp, String providedOtp, String errorMessage) {
        if (expectedOtp == null || expectedOtp.isBlank()) {
            throw new IllegalArgumentException("OTP is not generated for this ride.");
        }
        String normalized = providedOtp == null ? "" : providedOtp.trim();
        if (!expectedOtp.equals(normalized)) {
            throw new IllegalArgumentException(errorMessage);
        }
    }

    private static double calculateCancellationFee(Ride ride, String cancelledBy) {
        if ("DRIVER".equals(cancelledBy)) {
            return 0;
        }

        double fare = ride.getFare() == null ? 0 : Math.max(0, ride.getFare());
        if (ride.getStatus() == Ride.Status.REQUESTED) {
            return 0;
        }
        if (ride.getStatus() == Ride.Status.ACCEPTED) {
            return Math.min(60, Math.max(20, fare * 0.20));
        }
        if (ride.getStatus() == Ride.Status.PICKED) {
            return Math.min(180, Math.max(50, fare * 0.40));
        }
        return 0;
    }

    private void normalizePaymentState(Ride ride) {
        String mode = ride.getPaymentMode() == null ? "" : ride.getPaymentMode().trim().toUpperCase(Locale.ROOT);
        if (mode.isBlank()) {
            mode = "CASH";
        }
        ride.setPaymentMode(mode);

        if ("CARD".equals(mode) || "WALLET".equals(mode) || "UPI".equals(mode)) {
            String paymentReference = ride.getPaymentReference() == null ? "" : ride.getPaymentReference().trim();
            if (paymentReference.isBlank()) {
                throw new IllegalArgumentException("Online payment reference is required.");
            }

            try {
                Map<String, Object> verification = paymentService.verifyPaymentSession(paymentReference);
                boolean paid = Boolean.TRUE.equals(verification.get("paid"));
                if (!paid) {
                    throw new IllegalArgumentException("Online payment is not completed.");
                }
                ride.setPaymentReference(paymentReference);
                ride.setPaymentStatus("PAID");
            } catch (IllegalArgumentException validationError) {
                throw validationError;
            } catch (Exception paymentError) {
                throw new IllegalArgumentException("Unable to verify online payment.");
            }
            return;
        }

        if ("CASH".equals(mode)) {
            ride.setPaymentStatus("PAY_AT_END");
            if (ride.getPaymentReference() == null || ride.getPaymentReference().isBlank()) {
                ride.setPaymentReference("CASH");
            }
            return;
        }

        if (ride.getPaymentStatus() == null || ride.getPaymentStatus().isBlank()) {
            ride.setPaymentStatus("PENDING");
        }
    }

    private record FareProfile(
            String category,
            double baseFare,
            double distanceRate0To7,
            double distanceRateAbove7,
            double timeRate,
            double multiplier
    ) {
    }

    private record FareBreakdown(
            double baseFare,
            double distanceFare,
            double timeFare,
            int waitingCharge,
            double nightCharge,
            int totalFare
    ) {
    }
}
