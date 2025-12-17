package com.tickx.service.ticketmaster;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
public class TicketmasterClient {

    private static final String TM_BASE_URL = "https://app.ticketmaster.com/discovery/v2";
    private static final long RATE_LIMIT_DELAY_MS = 220; // ~4.5 req/sec

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private long lastRequestTime = 0;

    public TicketmasterClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    private void rateLimit() throws InterruptedException {
        long now = System.currentTimeMillis();
        long timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
            Thread.sleep(RATE_LIMIT_DELAY_MS - timeSinceLastRequest);
        }

        lastRequestTime = System.currentTimeMillis();
    }

    public JsonNode request(String endpoint, String apiKey, String... params) throws IOException, InterruptedException {
        rateLimit();

        StringBuilder urlBuilder = new StringBuilder(TM_BASE_URL)
                .append(endpoint)
                .append("?apikey=").append(apiKey);

        for (int i = 0; i < params.length; i += 2) {
            String key = params[i];
            String value = params[i + 1];
            if (value != null && !value.isEmpty()) {
                urlBuilder.append("&").append(key).append("=").append(value);
            }
        }

        String url = urlBuilder.toString();
        log.debug("TM API request: {}", endpoint);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("TM API error {}: {}", response.statusCode(), response.body());
            throw new IOException("Ticketmaster API error: " + response.statusCode());
        }

        return objectMapper.readTree(response.body());
    }

    public List<JsonNode> getAllEventsForCity(String city, String stateCode, String apiKey)
            throws IOException, InterruptedException {

        List<JsonNode> allEvents = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();

        LocalDate now = LocalDate.now();

        // Fetch events for 6 months in 1-month chunks
        for (int monthOffset = 0; monthOffset < 6; monthOffset++) {
            LocalDate startDate = now.plusMonths(monthOffset).withDayOfMonth(1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            String startDateTime = startDate.atStartOfDay()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
            String endDateTime = endDate.atTime(23, 59, 59)
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));

            log.info("Fetching {} {} events: {} to {}", city, stateCode,
                    startDate, endDate);

            int page = 0;
            boolean hasMore = true;

            while (hasMore) {
                try {
                    JsonNode response = request("/events.json", apiKey,
                            "city", city,
                            "stateCode", stateCode,
                            "countryCode", "US",
                            "startDateTime", startDateTime,
                            "endDateTime", endDateTime,
                            "size", "200",
                            "page", String.valueOf(page),
                            "sort", "date,asc"
                    );

                    JsonNode embedded = response.get("_embedded");
                    if (embedded != null && embedded.has("events")) {
                        for (JsonNode event : embedded.get("events")) {
                            String id = event.get("id").asText();
                            if (!seenIds.contains(id)) {
                                seenIds.add(id);
                                allEvents.add(event);
                            }
                        }
                    }

                    JsonNode pageInfo = response.get("page");
                    int totalPages = pageInfo != null ? pageInfo.get("totalPages").asInt(0) : 0;
                    int eventsOnPage = embedded != null && embedded.has("events")
                            ? embedded.get("events").size() : 0;

                    log.info("Page {}/{}, got {} events, total: {}",
                            page, totalPages, eventsOnPage, allEvents.size());

                    page++;
                    // Deep paging limit: size * page < 1000
                    hasMore = page < totalPages && page < 5;

                } catch (Exception e) {
                    log.error("Error fetching page {}: {}", page, e.getMessage());
                    hasMore = false;
                }
            }
        }

        log.info("Total events for {}, {}: {}", city, stateCode, allEvents.size());
        return allEvents;
    }
}
