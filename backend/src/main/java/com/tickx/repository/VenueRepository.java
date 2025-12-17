package com.tickx.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.dto.PaginatedResponse;
import com.tickx.model.Venue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class VenueRepository {

    private final DynamoDbClient dynamoDbClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.dynamodb.venues-table}")
    private String venuesTable;

    public Optional<Venue> findById(String venueId) {
        try {
            GetItemResponse response = dynamoDbClient.getItem(GetItemRequest.builder()
                    .tableName(venuesTable)
                    .key(Map.of(
                            "PK", AttributeValue.builder().s("VENUE#" + venueId).build(),
                            "SK", AttributeValue.builder().s("VENUE#" + venueId).build()
                    ))
                    .build());

            if (!response.hasItem() || response.item().isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(parseVenue(response.item()));
        } catch (Exception e) {
            log.error("Error fetching venue {}: {}", venueId, e.getMessage());
            return Optional.empty();
        }
    }

    public PaginatedResponse<Venue> findByCity(String city, int pageSize, String cursor) {
        String cityKey = city.toLowerCase().replace(" ", "_");

        try {
            QueryRequest.Builder requestBuilder = QueryRequest.builder()
                    .tableName(venuesTable)
                    .indexName("GSI1")
                    .keyConditionExpression("GSI1PK = :pk")
                    .expressionAttributeValues(Map.of(
                            ":pk", AttributeValue.builder().s("CITY#" + cityKey).build()
                    ))
                    .limit(pageSize);

            if (cursor != null && !cursor.isEmpty()) {
                requestBuilder.exclusiveStartKey(decodeCursor(cursor));
            }

            QueryResponse response = dynamoDbClient.query(requestBuilder.build());
            List<Venue> venues = response.items().stream()
                    .map(this::parseVenue)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            String nextCursor = response.lastEvaluatedKey() != null && !response.lastEvaluatedKey().isEmpty()
                    ? encodeCursor(response.lastEvaluatedKey())
                    : null;

            return PaginatedResponse.of(venues, pageSize, nextCursor != null, nextCursor);
        } catch (Exception e) {
            log.error("Error querying venues by city {}: {}", city, e.getMessage());
            return PaginatedResponse.of(List.of(), pageSize, false, null);
        }
    }

    public void save(Venue venue) {
        try {
            String dataJson = objectMapper.writeValueAsString(venue);
            String cityKey = venue.getCity().toLowerCase().replace(" ", "_");

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("PK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("SK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("GSI1PK", AttributeValue.builder().s("CITY#" + cityKey).build());
            item.put("GSI1SK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("entityType", AttributeValue.builder().s("VENUE").build());
            item.put("data", AttributeValue.builder().s(dataJson).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(venuesTable)
                    .item(item)
                    .build());
        } catch (JsonProcessingException e) {
            log.error("Error serializing venue {}: {}", venue.getId(), e.getMessage());
            throw new RuntimeException("Failed to serialize venue", e);
        }
    }

    public void saveBatch(List<Venue> venues) {
        // DynamoDB batch limit is 25
        for (int i = 0; i < venues.size(); i += 25) {
            List<Venue> batch = venues.subList(i, Math.min(i + 25, venues.size()));
            List<WriteRequest> writeRequests = batch.stream()
                    .map(this::createWriteRequest)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (!writeRequests.isEmpty()) {
                try {
                    dynamoDbClient.batchWriteItem(BatchWriteItemRequest.builder()
                            .requestItems(Map.of(venuesTable, writeRequests))
                            .build());
                } catch (Exception e) {
                    log.error("Error batch writing venues: {}", e.getMessage());
                }
            }
        }
    }

    private WriteRequest createWriteRequest(Venue venue) {
        try {
            String dataJson = objectMapper.writeValueAsString(venue);
            String cityKey = venue.getCity().toLowerCase().replace(" ", "_");

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("PK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("SK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("GSI1PK", AttributeValue.builder().s("CITY#" + cityKey).build());
            item.put("GSI1SK", AttributeValue.builder().s("VENUE#" + venue.getId()).build());
            item.put("entityType", AttributeValue.builder().s("VENUE").build());
            item.put("data", AttributeValue.builder().s(dataJson).build());

            return WriteRequest.builder()
                    .putRequest(PutRequest.builder().item(item).build())
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error creating write request for venue {}: {}", venue.getId(), e.getMessage());
            return null;
        }
    }

    private Venue parseVenue(Map<String, AttributeValue> item) {
        try {
            AttributeValue dataAttr = item.get("data");
            if (dataAttr == null || dataAttr.s() == null) {
                return null;
            }
            return objectMapper.readValue(dataAttr.s(), Venue.class);
        } catch (JsonProcessingException e) {
            log.error("Error parsing venue: {}", e.getMessage());
            return null;
        }
    }

    private String encodeCursor(Map<String, AttributeValue> lastKey) {
        try {
            Map<String, String> simplified = lastKey.entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().s()));
            return Base64.getEncoder().encodeToString(objectMapper.writeValueAsBytes(simplified));
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, AttributeValue> decodeCursor(String cursor) {
        try {
            byte[] decoded = Base64.getDecoder().decode(cursor);
            Map<String, String> simplified = objectMapper.readValue(decoded, Map.class);
            return simplified.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> AttributeValue.builder().s(e.getValue()).build()
                    ));
        } catch (Exception e) {
            return null;
        }
    }
}
