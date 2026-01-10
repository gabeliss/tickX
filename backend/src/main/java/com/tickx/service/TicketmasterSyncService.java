package com.tickx.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.tickx.model.Event;
import com.tickx.model.Venue;
import com.tickx.repository.EventRepository;
import com.tickx.repository.VenueRepository;
import com.tickx.client.TicketmasterClient;
import com.tickx.transformer.TicketmasterTransformer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketmasterSyncService {

    private final TicketmasterClient ticketmasterClient;
    private final TicketmasterTransformer transformer;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SsmClient ssmClient;

    @Value("${TM_API_KEY_PARAM}")
    private String apiKeyParamName;

    @Value("${SYNC_ENABLED:true}")
    private boolean syncEnabled;

    private static final List<CityConfig> CITIES_TO_SYNC = List.of(
            new CityConfig("Chicago", "IL"),
            new CityConfig("New York", "NY")
    );

    private record CityConfig(String city, String stateCode) {}

    public void scheduledSync() {
        if (!syncEnabled) {
            log.info("Scheduled sync is disabled");
            return;
        }
        sync();
    }

    public SyncResult sync() {
        log.info("Starting Ticketmaster sync");
        long startTime = System.currentTimeMillis();

        SyncResult result = new SyncResult();

        try {
            String apiKey = getApiKey();

            for (CityConfig cityConfig : CITIES_TO_SYNC) {
                try {
                    CityResult cityResult = syncCity(cityConfig.city, cityConfig.stateCode, apiKey);
                    result.cityResults.add(cityResult);
                    result.totalEventsSaved += cityResult.eventsSaved;
                    result.totalVenuesSaved += cityResult.venuesSaved;
                } catch (Exception e) {
                    log.error("Failed to sync {}, {}: {}", cityConfig.city, cityConfig.stateCode, e.getMessage());
                    result.cityResults.add(new CityResult(
                            cityConfig.city + ", " + cityConfig.stateCode, 0, 0, 0, 0, 0
                    ));
                }
            }

            result.durationMs = System.currentTimeMillis() - startTime;
            result.success = true;

            log.info("Sync completed in {}ms: {} events, {} venues",
                    result.durationMs, result.totalEventsSaved, result.totalVenuesSaved);

        } catch (Exception e) {
            log.error("Sync failed: {}", e.getMessage());
            result.success = false;
            result.error = e.getMessage();
            result.durationMs = System.currentTimeMillis() - startTime;
        }

        return result;
    }

    private CityResult syncCity(String city, String stateCode, String apiKey) throws Exception {
        log.info("Syncing {}, {}", city, stateCode);

        List<JsonNode> tmEvents = ticketmasterClient.getAllEventsForCity(city, stateCode, apiKey);

        List<Event> events = new ArrayList<>();
        Map<String, Venue> venuesMap = new HashMap<>();

        for (JsonNode tmEvent : tmEvents) {
            Event event = transformer.transformEvent(tmEvent);
            if (event != null) {
                events.add(event);
            }

            // Extract venue
            if (tmEvent.has("_embedded") && tmEvent.get("_embedded").has("venues")) {
                JsonNode tmVenue = tmEvent.get("_embedded").get("venues").get(0);
                String venueId = tmVenue.get("id").asText();
                if (!venuesMap.containsKey(venueId)) {
                    Venue venue = transformer.transformVenue(tmVenue);
                    if (venue != null) {
                        venuesMap.put(venueId, venue);
                    }
                }
            }
        }

        List<Venue> venues = new ArrayList<>(venuesMap.values());

        log.info("Transformed {} events and {} venues for {}, {}",
                events.size(), venues.size(), city, stateCode);

        // Save venues first
        if (!venues.isEmpty()) {
            venueRepository.saveBatch(venues);
            log.info("Saved {} venues", venues.size());
        }

        // Save events
        if (!events.isEmpty()) {
            eventRepository.saveBatch(events);
            log.info("Saved {} events", events.size());
        }

        return new CityResult(
                city + ", " + stateCode,
                tmEvents.size(),
                events.size(),
                0, // failed count not tracked in batch
                venues.size(),
                venues.size()
        );
    }

    private String getApiKey() {
        try {
            return ssmClient.getParameter(GetParameterRequest.builder()
                            .name(apiKeyParamName)
                            .withDecryption(true)
                            .build())
                    .parameter()
                    .value();
        } catch (Exception e) {
            log.error("Failed to get API key from SSM: {}", e.getMessage());
            throw new RuntimeException("Failed to get Ticketmaster API key", e);
        }
    }

    public static class SyncResult {
        public boolean success;
        public String error;
        public long durationMs;
        public int totalEventsSaved;
        public int totalVenuesSaved;
        public List<CityResult> cityResults = new ArrayList<>();
    }

    public record CityResult(
            String city,
            int eventsFound,
            int eventsSaved,
            int eventsFailed,
            int venuesFound,
            int venuesSaved
    ) {}
}
