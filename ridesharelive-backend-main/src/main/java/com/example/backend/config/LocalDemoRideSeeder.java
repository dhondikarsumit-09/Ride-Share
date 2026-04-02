package com.example.backend.config;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.backend.entity.Ride;
import com.example.backend.entity.User;
import com.example.backend.repository.RideRepository;
import com.example.backend.repository.UserRepository;

@Component
@Profile("local")
public class LocalDemoRideSeeder implements ApplicationRunner {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final boolean demoDataEnabled;

    public LocalDemoRideSeeder(
            RideRepository rideRepository,
            UserRepository userRepository,
            @Value("${app.demo.seed-driver-queue:false}") boolean demoDataEnabled
    ) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.demoDataEnabled = demoDataEnabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!demoDataEnabled) {
            return;
        }

        List<Ride> openRides = rideRepository.findAll().stream()
                .filter(ride -> ride.getStatus() == Ride.Status.REQUESTED && ride.getDriverId() == null)
                .toList();

        if (openRides.size() >= 4) {
            return;
        }

        List<User> riders = userRepository.findAll().stream()
                .filter(user -> {
                    String role = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();
                    return "RIDER".equals(role) || "USER".equals(role);
                })
                .toList();

        if (riders.isEmpty()) {
            return;
        }

        List<Ride> demoRides = new ArrayList<>();
        int missingCount = 4 - openRides.size();
        for (int index = 0; index < missingCount; index++) {
            User rider = riders.get(index % riders.size());
            demoRides.add(buildRequestedRide(index, rider.getId()));
        }

        rideRepository.saveAll(demoRides);
    }

    private Ride buildRequestedRide(int index, Long riderId) {
        return switch (index) {
            case 0 -> Ride.builder()
                    .pickupLocation("Multai Bus Stand")
                    .dropLocation("Chandora Khurd")
                    .pickupLat(21.77095)
                    .pickupLon(78.2543497)
                    .dropLat(21.7923049)
                    .dropLon(78.2726596)
                    .fare(25.0)
                    .riderId(riderId)
                    .paymentMode("CASH")
                    .paymentReference("CASH")
                    .paymentStatus("PAY_AT_END")
                    .status(Ride.Status.REQUESTED)
                    .createdAt(Instant.now().minusSeconds(90))
                    .build();
            case 1 -> Ride.builder()
                    .pickupLocation("Multai Market")
                    .dropLocation("Parmandal")
                    .pickupLat(21.77095)
                    .pickupLon(78.2543497)
                    .dropLat(21.8060822)
                    .dropLon(78.2421162)
                    .fare(25.0)
                    .riderId(riderId)
                    .paymentMode("CASH")
                    .paymentReference("CASH")
                    .paymentStatus("PAY_AT_END")
                    .status(Ride.Status.REQUESTED)
                    .createdAt(Instant.now().minusSeconds(70))
                    .build();
            case 2 -> Ride.builder()
                    .pickupLocation("Multai Railway Station")
                    .dropLocation("Jaulkhera")
                    .pickupLat(21.7828449)
                    .pickupLon(78.2635080)
                    .dropLat(21.7364)
                    .dropLon(78.3005)
                    .fare(40.0)
                    .riderId(riderId)
                    .paymentMode("UPI")
                    .paymentReference("pay_dummy_local_1")
                    .paymentStatus("PENDING")
                    .status(Ride.Status.REQUESTED)
                    .createdAt(Instant.now().minusSeconds(50))
                    .build();
            default -> Ride.builder()
                    .pickupLocation("Betul Naka, Multai")
                    .dropLocation("Aamadoh")
                    .pickupLat(21.77095)
                    .pickupLon(78.2543497)
                    .dropLat(21.7512)
                    .dropLon(78.2106)
                    .fare(35.0)
                    .riderId(riderId)
                    .paymentMode("CARD")
                    .paymentReference("pay_dummy_local_2")
                    .paymentStatus("PAID")
                    .status(Ride.Status.REQUESTED)
                    .createdAt(Instant.now().minusSeconds(30))
                    .build();
        };
    }
}
