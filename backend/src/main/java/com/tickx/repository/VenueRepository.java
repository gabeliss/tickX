package com.tickx.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Value("${VENUES_TABLE}")
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

    public List<Venue> findByCity(String city, int pageSize, String cursor) {
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

            return venues;
        } catch (Exception e) {
            log.error("Error querying venues by city {}: {}", city, e.getMessage());
            return List.of();
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
            if (dataAttr == null) {
                return null;
            }

            // Handle both String type (new Java format) and Map type (TypeScript format)
            if (dataAttr.s() != null) {
                return objectMapper.readValue(dataAttr.s(), Venue.class);
            } else if (dataAttr.m() != null && !dataAttr.m().isEmpty()) {
                Map<String, Object> dataMap = convertAttributeMapToJavaMap(dataAttr.m());
                return objectMapper.convertValue(dataMap, Venue.class);
            }
            return null;
        } catch (Exception e) {
            log.error("Error parsing venue: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> convertAttributeMapToJavaMap(Map<String, AttributeValue> attrMap) {
        Map<String, Object> result = new HashMap<>();
        for (Map.Entry<String, AttributeValue> entry : attrMap.entrySet()) {
            result.put(entry.getKey(), convertAttributeValue(entry.getValue()));
        }
        return result;
    }

    private Object convertAttributeValue(AttributeValue av) {
        if (av.s() != null) return av.s();
        if (av.n() != null) {
            String num = av.n();
            if (num.contains(".")) return Double.parseDouble(num);
            return Long.parseLong(num);
        }
        if (av.bool() != null) return av.bool();
        if (av.m() != null && !av.m().isEmpty()) return convertAttributeMapToJavaMap(av.m());
        if (av.l() != null && !av.l().isEmpty()) {
            return av.l().stream().map(this::convertAttributeValue).collect(Collectors.toList());
        }
        if (av.nul() != null && av.nul()) return null;
        return null;
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
