package com.tickx.controller;

import com.tickx.dto.ApiResponse;
import com.tickx.dto.PaginatedResponse;
import com.tickx.model.Event;
import com.tickx.model.EventCategory;
import com.tickx.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;

    private static final List<String> VALID_CATEGORIES = Arrays.asList(
            "concert", "sports", "theater", "festival", "comedy", "other"
    );

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<Event>> getEvent(@PathVariable String eventId) {
        log.info("GET /events/{}", eventId);

        return eventRepository.findById(eventId)
                .map(event -> ResponseEntity.ok(ApiResponse.success(event)))
                .orElse(ResponseEntity.status(404)
                        .body(ApiResponse.error("Event not found", "No event found with id: " + eventId)));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<Event>> getEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String venueId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "50") int pageSize) {

        log.info("GET /events - city={}, category={}, venueId={}, keyword={}, q={}",
                city, category, venueId, keyword, q);

        // Limit page size
        pageSize = Math.min(pageSize, 100);

        // Use keyword or q parameter for search
        String searchKeyword = keyword != null ? keyword : q;

        // If keyword search is provided, use search function
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            String validCategory = isValidCategory(category) ? category : null;
            PaginatedResponse<Event> result = eventRepository.searchByKeyword(
                    searchKeyword, city, validCategory, pageSize
            );
            return ResponseEntity.ok(result);
        }

        // Query by specific filters
        PaginatedResponse<Event> result;

        if (venueId != null && !venueId.isEmpty()) {
            result = eventRepository.findByVenue(venueId, dateFrom, dateTo, pageSize, cursor);
        } else if (category != null && isValidCategory(category)) {
            result = eventRepository.findByCategory(category, dateFrom, dateTo, pageSize, cursor);
            // If city is also provided, filter in memory
            if (city != null && !city.isEmpty()) {
                String targetCity = getCityName(city);
                result = filterByCity(result, targetCity, pageSize);
            }
        } else if (city != null && !city.isEmpty()) {
            result = eventRepository.findByCity(city, dateFrom, dateTo, pageSize, cursor);
        } else {
            // Default: return Chicago events
            result = eventRepository.findByCity("chicago", dateFrom, dateTo, pageSize, cursor);
        }

        return ResponseEntity.ok(result);
    }

    private boolean isValidCategory(String category) {
        return category != null && VALID_CATEGORIES.contains(category.toLowerCase());
    }

    private String getCityName(String city) {
        return switch (city.toLowerCase()) {
            case "chicago" -> "Chicago";
            case "new_york" -> "New York";
            default -> city;
        };
    }

    private PaginatedResponse<Event> filterByCity(PaginatedResponse<Event> result, String city, int pageSize) {
        List<Event> filtered = result.getData().stream()
                .filter(e -> e.getVenueCity() != null && e.getVenueCity().equalsIgnoreCase(city))
                .toList();

        return PaginatedResponse.of(filtered, pageSize, result.getPagination().isHasMore(),
                result.getPagination().getCursor());
    }
}
