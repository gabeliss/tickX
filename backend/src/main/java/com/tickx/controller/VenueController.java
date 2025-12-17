package com.tickx.controller;

import com.tickx.dto.ApiResponse;
import com.tickx.dto.PaginatedResponse;
import com.tickx.model.Venue;
import com.tickx.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueRepository venueRepository;

    @GetMapping("/{venueId}")
    public ResponseEntity<ApiResponse<Venue>> getVenue(@PathVariable String venueId) {
        log.info("GET /venues/{}", venueId);

        return venueRepository.findById(venueId)
                .map(venue -> ResponseEntity.ok(ApiResponse.success(venue)))
                .orElse(ResponseEntity.status(404)
                        .body(ApiResponse.error("Venue not found", "No venue found with id: " + venueId)));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<Venue>> getVenues(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "50") int pageSize) {

        log.info("GET /venues - city={}", city);

        // Limit page size
        pageSize = Math.min(pageSize, 100);

        if (city == null || city.isEmpty()) {
            // Default to Chicago
            city = "chicago";
        }

        PaginatedResponse<Venue> result = venueRepository.findByCity(city, pageSize, cursor);
        return ResponseEntity.ok(result);
    }
}
