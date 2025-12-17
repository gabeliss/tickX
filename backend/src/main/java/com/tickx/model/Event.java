package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    private String id;
    private String name;
    private String description;
    private EventCategory category;
    private EventStatus status;

    // Date & Time
    private String eventDate;
    private String localDate;
    private String localTime;
    private String timezone;
    private String doorTime;
    private String endDate;

    // Venue (denormalized)
    private String venueId;
    private String venueName;
    private String venueCity;
    private String venueState;
    private String venueStateCode;

    // Images
    private String imageUrl;
    private String thumbnailUrl;
    private List<EventImage> images;

    // Pricing
    private Double minPrice;
    private Double maxPrice;
    private String currency;

    // Attractions
    private List<Attraction> attractions;

    // Classifications
    private String segment;
    private String genre;
    private String subGenre;

    // Metadata
    private String url;
    private String seatmapUrl;
    private String pleaseNote;
    private Integer ticketLimit;
    private String ageRestriction;

    // TickX specific
    private Boolean isFeatured;
    private Integer listingCount;

    // DynamoDB metadata
    private String createdAt;
    private String updatedAt;
    private String source;
}
