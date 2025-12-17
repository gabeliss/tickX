package com.tickx.service.ticketmaster;

import com.fasterxml.jackson.databind.JsonNode;
import com.tickx.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
public class TicketmasterTransformer {

    public Event transformEvent(JsonNode tmEvent) {
        if (tmEvent == null || !tmEvent.has("id") || !tmEvent.has("name")) {
            return null;
        }

        String eventId = tmEvent.get("id").asText();
        String eventName = tmEvent.get("name").asText();

        // Get venue
        JsonNode venue = getFirstVenue(tmEvent);
        if (venue == null) {
            log.warn("Skipping event {}: no venue", eventId);
            return null;
        }

        // Get dates
        JsonNode dates = tmEvent.get("dates");
        if (dates == null || !dates.has("start") || !dates.get("start").has("localDate")) {
            log.warn("Skipping event {}: no date", eventId);
            return null;
        }

        JsonNode start = dates.get("start");
        String localDate = start.get("localDate").asText();
        String localTime = start.has("localTime") ? start.get("localTime").asText() : null;

        // Build event date
        String eventDate = localDate;
        if (localTime != null) {
            eventDate = localDate + "T" + localTime;
        } else if (start.has("dateTime")) {
            eventDate = start.get("dateTime").asText();
        }

        // Get classification
        JsonNode primaryClassification = getPrimaryClassification(tmEvent);
        String segment = primaryClassification != null && primaryClassification.has("segment")
                ? primaryClassification.get("segment").get("name").asText() : "Miscellaneous";
        EventCategory category = EventCategory.fromTicketmasterSegment(segment);

        // Get status
        String tmStatus = dates.has("status") && dates.get("status").has("code")
                ? dates.get("status").get("code").asText() : "onsale";
        EventStatus status = EventStatus.fromTicketmasterStatus(tmStatus);

        // Get pricing
        Double minPrice = null;
        Double maxPrice = null;
        String currency = "USD";
        if (tmEvent.has("priceRanges")) {
            for (JsonNode priceRange : tmEvent.get("priceRanges")) {
                if (minPrice == null || priceRange.get("min").asDouble() < minPrice) {
                    minPrice = priceRange.get("min").asDouble();
                }
                if (maxPrice == null || priceRange.get("max").asDouble() > maxPrice) {
                    maxPrice = priceRange.get("max").asDouble();
                }
                if (priceRange.has("currency")) {
                    currency = priceRange.get("currency").asText();
                }
            }
        }

        // Get images
        ImageSelection images = selectBestImage(tmEvent.get("images"));

        // Get attractions
        List<Attraction> attractions = transformAttractions(tmEvent);

        String now = Instant.now().toString();

        return Event.builder()
                .id(eventId)
                .name(eventName)
                .description(getTextOrNull(tmEvent, "description", "info"))
                .category(category)
                .status(status)
                .eventDate(eventDate)
                .localDate(localDate)
                .localTime(localTime)
                .timezone(getTextOrNull(dates, "timezone"))
                .doorTime(dates.has("doorTime") && dates.get("doorTime").has("localTime")
                        ? dates.get("doorTime").get("localTime").asText() : null)
                .endDate(dates.has("end") && dates.get("end").has("dateTime")
                        ? dates.get("end").get("dateTime").asText() : null)
                .venueId(venue.get("id").asText())
                .venueName(venue.get("name").asText())
                .venueCity(venue.has("city") ? venue.get("city").get("name").asText("") : "")
                .venueState(venue.has("state") ? venue.get("state").get("name").asText("") : "")
                .venueStateCode(venue.has("state") ? venue.get("state").get("stateCode").asText("") : "")
                .imageUrl(images.imageUrl)
                .thumbnailUrl(images.thumbnailUrl)
                .images(transformImages(tmEvent.get("images")))
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .currency(currency)
                .attractions(attractions)
                .segment(segment)
                .genre(primaryClassification != null && primaryClassification.has("genre")
                        ? primaryClassification.get("genre").get("name").asText() : null)
                .subGenre(primaryClassification != null && primaryClassification.has("subGenre")
                        ? primaryClassification.get("subGenre").get("name").asText() : null)
                .url(getTextOrNull(tmEvent, "url"))
                .seatmapUrl(tmEvent.has("seatmap") ? getTextOrNull(tmEvent.get("seatmap"), "staticUrl") : null)
                .pleaseNote(getTextOrNull(tmEvent, "pleaseNote"))
                .ticketLimit(tmEvent.has("ticketLimit") && tmEvent.get("ticketLimit").has("info")
                        ? parseIntOrNull(tmEvent.get("ticketLimit").get("info").asText()) : null)
                .isFeatured(false)
                .listingCount(0)
                .createdAt(now)
                .updatedAt(now)
                .source("ticketmaster")
                .build();
    }

    public Venue transformVenue(JsonNode tmVenue) {
        if (tmVenue == null || !tmVenue.has("id") || !tmVenue.has("name")) {
            return null;
        }

        String now = Instant.now().toString();

        // Get best image
        String imageUrl = null;
        if (tmVenue.has("images")) {
            for (JsonNode img : tmVenue.get("images")) {
                if (img.has("ratio") && img.get("ratio").asText().equals("16_9")) {
                    imageUrl = img.get("url").asText();
                    break;
                }
            }
            if (imageUrl == null && tmVenue.get("images").size() > 0) {
                imageUrl = tmVenue.get("images").get(0).get("url").asText();
            }
        }

        // Build address
        StringBuilder address = new StringBuilder();
        if (tmVenue.has("address")) {
            JsonNode addr = tmVenue.get("address");
            if (addr.has("line1")) address.append(addr.get("line1").asText());
            if (addr.has("line2")) {
                if (address.length() > 0) address.append(", ");
                address.append(addr.get("line2").asText());
            }
        }

        return Venue.builder()
                .id(tmVenue.get("id").asText())
                .name(tmVenue.get("name").asText())
                .address(address.toString())
                .city(tmVenue.has("city") ? tmVenue.get("city").get("name").asText("") : "")
                .state(tmVenue.has("state") ? tmVenue.get("state").get("name").asText("") : "")
                .stateCode(tmVenue.has("state") ? tmVenue.get("state").get("stateCode").asText("") : "")
                .country(tmVenue.has("country") ? tmVenue.get("country").get("name").asText("United States") : "United States")
                .countryCode(tmVenue.has("country") ? tmVenue.get("country").get("countryCode").asText("US") : "US")
                .postalCode(getTextOrNull(tmVenue, "postalCode"))
                .timezone(tmVenue.has("timezone") ? tmVenue.get("timezone").asText("America/New_York") : "America/New_York")
                .latitude(tmVenue.has("location") && tmVenue.get("location").has("latitude")
                        ? parseDoubleOrNull(tmVenue.get("location").get("latitude").asText()) : null)
                .longitude(tmVenue.has("location") && tmVenue.get("location").has("longitude")
                        ? parseDoubleOrNull(tmVenue.get("location").get("longitude").asText()) : null)
                .imageUrl(imageUrl)
                .url(getTextOrNull(tmVenue, "url"))
                .parkingInfo(getTextOrNull(tmVenue, "parkingDetail"))
                .boxOfficeInfo(tmVenue.has("boxOfficeInfo") && tmVenue.get("boxOfficeInfo").has("phoneNumberDetail")
                        ? tmVenue.get("boxOfficeInfo").get("phoneNumberDetail").asText() : null)
                .generalInfo(tmVenue.has("generalInfo") && tmVenue.get("generalInfo").has("generalRule")
                        ? tmVenue.get("generalInfo").get("generalRule").asText() : null)
                .createdAt(now)
                .updatedAt(now)
                .source("ticketmaster")
                .build();
    }

    private JsonNode getFirstVenue(JsonNode tmEvent) {
        if (!tmEvent.has("_embedded")) return null;
        JsonNode embedded = tmEvent.get("_embedded");
        if (!embedded.has("venues") || embedded.get("venues").size() == 0) return null;
        return embedded.get("venues").get(0);
    }

    private JsonNode getPrimaryClassification(JsonNode tmEvent) {
        if (!tmEvent.has("classifications")) return null;
        for (JsonNode classification : tmEvent.get("classifications")) {
            if (classification.has("primary") && classification.get("primary").asBoolean()) {
                return classification;
            }
        }
        return tmEvent.get("classifications").size() > 0 ? tmEvent.get("classifications").get(0) : null;
    }

    private record ImageSelection(String imageUrl, String thumbnailUrl) {}

    private ImageSelection selectBestImage(JsonNode images) {
        if (images == null || images.size() == 0) {
            return new ImageSelection("", null);
        }

        List<JsonNode> sortedImages = new ArrayList<>();
        images.forEach(sortedImages::add);

        // Sort: prefer non-fallback, 16_9, larger width
        sortedImages.sort((a, b) -> {
            boolean aFallback = a.has("fallback") && a.get("fallback").asBoolean();
            boolean bFallback = b.has("fallback") && b.get("fallback").asBoolean();
            if (aFallback != bFallback) return aFallback ? 1 : -1;

            String aRatio = a.has("ratio") ? a.get("ratio").asText() : "";
            String bRatio = b.has("ratio") ? b.get("ratio").asText() : "";
            if (aRatio.equals("16_9") && !bRatio.equals("16_9")) return -1;
            if (!aRatio.equals("16_9") && bRatio.equals("16_9")) return 1;

            int aWidth = a.has("width") ? a.get("width").asInt() : 0;
            int bWidth = b.has("width") ? b.get("width").asInt() : 0;
            return bWidth - aWidth;
        });

        String imageUrl = sortedImages.get(0).get("url").asText("");

        // Find thumbnail (300-500px wide)
        String thumbnailUrl = sortedImages.stream()
                .filter(img -> {
                    int width = img.has("width") ? img.get("width").asInt() : 0;
                    return width >= 300 && width <= 500;
                })
                .findFirst()
                .map(img -> img.get("url").asText())
                .orElse(sortedImages.get(sortedImages.size() - 1).get("url").asText(""));

        return new ImageSelection(imageUrl, thumbnailUrl);
    }

    private List<EventImage> transformImages(JsonNode images) {
        if (images == null) return null;

        List<EventImage> result = new ArrayList<>();
        for (JsonNode img : images) {
            result.add(EventImage.builder()
                    .url(img.get("url").asText(""))
                    .width(img.has("width") ? img.get("width").asInt() : 0)
                    .height(img.has("height") ? img.get("height").asInt() : 0)
                    .ratio(img.has("ratio") ? img.get("ratio").asText() : null)
                    .fallback(img.has("fallback") ? img.get("fallback").asBoolean() : null)
                    .build());
        }
        return result;
    }

    private List<Attraction> transformAttractions(JsonNode tmEvent) {
        if (!tmEvent.has("_embedded")) return null;
        JsonNode embedded = tmEvent.get("_embedded");
        if (!embedded.has("attractions")) return null;

        List<Attraction> attractions = new ArrayList<>();
        for (JsonNode att : embedded.get("attractions")) {
            String imageUrl = null;
            if (att.has("images") && att.get("images").size() > 0) {
                imageUrl = att.get("images").get(0).get("url").asText();
            }

            attractions.add(Attraction.builder()
                    .id(att.get("id").asText())
                    .name(att.get("name").asText())
                    .type(att.has("type") ? att.get("type").asText() : null)
                    .imageUrl(imageUrl)
                    .url(att.has("url") ? att.get("url").asText() : null)
                    .build());
        }
        return attractions;
    }

    private String getTextOrNull(JsonNode node, String... fields) {
        for (String field : fields) {
            if (node.has(field) && !node.get(field).isNull()) {
                return node.get(field).asText();
            }
        }
        return null;
    }

    private Integer parseIntOrNull(String value) {
        try {
            return Integer.parseInt(value.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return null;
        }
    }

    private Double parseDoubleOrNull(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return null;
        }
    }
}
