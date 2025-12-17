package com.tickx.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.dto.PaginatedResponse;
import com.tickx.model.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class EventRepository {

    private final DynamoDbClient dynamoDbClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.dynamodb.events-table}")
    private String eventsTable;

    public Optional<Event> findById(String eventId) {
        try {
            GetItemResponse response = dynamoDbClient.getItem(GetItemRequest.builder()
                    .tableName(eventsTable)
                    .key(Map.of(
                            "PK", AttributeValue.builder().s("EVENT#" + eventId).build(),
                            "SK", AttributeValue.builder().s("EVENT#" + eventId).build()
                    ))
                    .build());

            if (!response.hasItem() || response.item().isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(parseEvent(response.item()));
        } catch (Exception e) {
            log.error("Error fetching event {}: {}", eventId, e.getMessage());
            return Optional.empty();
        }
    }

    public PaginatedResponse<Event> findByCity(String city, String dateFrom, String dateTo,
                                                int pageSize, String cursor) {
        String cityKey = city.toLowerCase().replace(" ", "_");
        String today = LocalDate.now().toString();
        String from = dateFrom != null ? dateFrom : today;
        String to = dateTo != null ? dateTo : "2099-12-31";

        try {
            QueryRequest.Builder requestBuilder = QueryRequest.builder()
                    .tableName(eventsTable)
                    .indexName("GSI1")
                    .keyConditionExpression("GSI1PK = :pk AND GSI1SK BETWEEN :skStart AND :skEnd")
                    .expressionAttributeValues(Map.of(
                            ":pk", AttributeValue.builder().s("CITY#" + cityKey).build(),
                            ":skStart", AttributeValue.builder().s("DATE#" + from).build(),
                            ":skEnd", AttributeValue.builder().s("DATE#" + to + "#EVENT#zzz").build()
                    ))
                    .limit(pageSize);

            if (cursor != null && !cursor.isEmpty()) {
                requestBuilder.exclusiveStartKey(decodeCursor(cursor));
            }

            QueryResponse response = dynamoDbClient.query(requestBuilder.build());
            List<Event> events = response.items().stream()
                    .map(this::parseEvent)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            String nextCursor = response.lastEvaluatedKey() != null && !response.lastEvaluatedKey().isEmpty()
                    ? encodeCursor(response.lastEvaluatedKey())
                    : null;

            return PaginatedResponse.of(events, pageSize, nextCursor != null, nextCursor);
        } catch (Exception e) {
            log.error("Error querying events by city {}: {}", city, e.getMessage());
            return PaginatedResponse.of(List.of(), pageSize, false, null);
        }
    }

    public PaginatedResponse<Event> findByCategory(String category, String dateFrom, String dateTo,
                                                    int pageSize, String cursor) {
        String today = LocalDate.now().toString();
        String from = dateFrom != null ? dateFrom : today;
        String to = dateTo != null ? dateTo : "2099-12-31";

        try {
            QueryRequest.Builder requestBuilder = QueryRequest.builder()
                    .tableName(eventsTable)
                    .indexName("GSI2")
                    .keyConditionExpression("GSI2PK = :pk AND GSI2SK BETWEEN :skStart AND :skEnd")
                    .expressionAttributeValues(Map.of(
                            ":pk", AttributeValue.builder().s("CATEGORY#" + category).build(),
                            ":skStart", AttributeValue.builder().s("DATE#" + from).build(),
                            ":skEnd", AttributeValue.builder().s("DATE#" + to + "#EVENT#zzz").build()
                    ))
                    .limit(pageSize);

            if (cursor != null && !cursor.isEmpty()) {
                requestBuilder.exclusiveStartKey(decodeCursor(cursor));
            }

            QueryResponse response = dynamoDbClient.query(requestBuilder.build());
            List<Event> events = response.items().stream()
                    .map(this::parseEvent)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            String nextCursor = response.lastEvaluatedKey() != null && !response.lastEvaluatedKey().isEmpty()
                    ? encodeCursor(response.lastEvaluatedKey())
                    : null;

            return PaginatedResponse.of(events, pageSize, nextCursor != null, nextCursor);
        } catch (Exception e) {
            log.error("Error querying events by category {}: {}", category, e.getMessage());
            return PaginatedResponse.of(List.of(), pageSize, false, null);
        }
    }

    public PaginatedResponse<Event> findByVenue(String venueId, String dateFrom, String dateTo,
                                                 int pageSize, String cursor) {
        String today = LocalDate.now().toString();
        String from = dateFrom != null ? dateFrom : today;
        String to = dateTo != null ? dateTo : "2099-12-31";

        try {
            QueryRequest.Builder requestBuilder = QueryRequest.builder()
                    .tableName(eventsTable)
                    .indexName("GSI3")
                    .keyConditionExpression("GSI3PK = :pk AND GSI3SK BETWEEN :skStart AND :skEnd")
                    .expressionAttributeValues(Map.of(
                            ":pk", AttributeValue.builder().s("VENUE#" + venueId).build(),
                            ":skStart", AttributeValue.builder().s("DATE#" + from).build(),
                            ":skEnd", AttributeValue.builder().s("DATE#" + to + "#EVENT#zzz").build()
                    ))
                    .limit(pageSize);

            if (cursor != null && !cursor.isEmpty()) {
                requestBuilder.exclusiveStartKey(decodeCursor(cursor));
            }

            QueryResponse response = dynamoDbClient.query(requestBuilder.build());
            List<Event> events = response.items().stream()
                    .map(this::parseEvent)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            String nextCursor = response.lastEvaluatedKey() != null && !response.lastEvaluatedKey().isEmpty()
                    ? encodeCursor(response.lastEvaluatedKey())
                    : null;

            return PaginatedResponse.of(events, pageSize, nextCursor != null, nextCursor);
        } catch (Exception e) {
            log.error("Error querying events by venue {}: {}", venueId, e.getMessage());
            return PaginatedResponse.of(List.of(), pageSize, false, null);
        }
    }

    public PaginatedResponse<Event> searchByKeyword(String keyword, String city, String category, int pageSize) {
        String keywordLower = keyword.toLowerCase();
        String today = LocalDate.now().toString();

        try {
            // Scan all events (MVP approach - will migrate to OpenSearch for production)
            List<Event> allEvents = new ArrayList<>();
            Map<String, AttributeValue> lastKey = null;

            do {
                ScanRequest.Builder requestBuilder = ScanRequest.builder()
                        .tableName(eventsTable)
                        .filterExpression("entityType = :entityType")
                        .expressionAttributeValues(Map.of(
                                ":entityType", AttributeValue.builder().s("EVENT").build()
                        ));

                if (lastKey != null) {
                    requestBuilder.exclusiveStartKey(lastKey);
                }

                ScanResponse response = dynamoDbClient.scan(requestBuilder.build());
                response.items().stream()
                        .map(this::parseEvent)
                        .filter(Objects::nonNull)
                        .forEach(allEvents::add);

                lastKey = response.lastEvaluatedKey();
            } while (lastKey != null && !lastKey.isEmpty());

            // Filter in memory
            List<Event> filtered = allEvents.stream()
                    .filter(event -> event.getLocalDate() != null && event.getLocalDate().compareTo(today) >= 0)
                    .filter(event -> {
                        if (city != null && !city.isEmpty()) {
                            String venueCity = event.getVenueCity();
                            if (venueCity == null) return false;
                            if (city.equals("chicago") && !venueCity.equals("Chicago")) return false;
                            if (city.equals("new_york") && !venueCity.equals("New York")) return false;
                        }
                        return true;
                    })
                    .filter(event -> {
                        if (category != null && !category.isEmpty()) {
                            return event.getCategory() != null &&
                                   event.getCategory().getValue().equals(category);
                        }
                        return true;
                    })
                    .filter(event -> matchesKeyword(event, keywordLower))
                    .sorted(Comparator.comparing(Event::getLocalDate))
                    .limit(pageSize)
                    .collect(Collectors.toList());

            return PaginatedResponse.of(filtered, pageSize, filtered.size() >= pageSize, null);
        } catch (Exception e) {
            log.error("Error searching events: {}", e.getMessage());
            return PaginatedResponse.of(List.of(), pageSize, false, null);
        }
    }

    private boolean matchesKeyword(Event event, String keyword) {
        if (event.getName() != null && event.getName().toLowerCase().contains(keyword)) {
            return true;
        }
        if (event.getAttractions() != null) {
            for (var attraction : event.getAttractions()) {
                if (attraction.getName() != null && attraction.getName().toLowerCase().contains(keyword)) {
                    return true;
                }
            }
        }
        if (event.getGenre() != null && event.getGenre().toLowerCase().contains(keyword)) {
            return true;
        }
        if (event.getSubGenre() != null && event.getSubGenre().toLowerCase().contains(keyword)) {
            return true;
        }
        if (event.getVenueName() != null && event.getVenueName().toLowerCase().contains(keyword)) {
            return true;
        }
        return false;
    }

    public void save(Event event) {
        try {
            String dataJson = objectMapper.writeValueAsString(event);
            String cityKey = event.getVenueCity().toLowerCase().replace(" ", "_");

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("PK", AttributeValue.builder().s("EVENT#" + event.getId()).build());
            item.put("SK", AttributeValue.builder().s("EVENT#" + event.getId()).build());
            item.put("GSI1PK", AttributeValue.builder().s("CITY#" + cityKey).build());
            item.put("GSI1SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("GSI2PK", AttributeValue.builder().s("CATEGORY#" + event.getCategory().getValue()).build());
            item.put("GSI2SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("GSI3PK", AttributeValue.builder().s("VENUE#" + event.getVenueId()).build());
            item.put("GSI3SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("entityType", AttributeValue.builder().s("EVENT").build());
            item.put("data", AttributeValue.builder().s(dataJson).build());

            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(eventsTable)
                    .item(item)
                    .build());
        } catch (JsonProcessingException e) {
            log.error("Error serializing event {}: {}", event.getId(), e.getMessage());
            throw new RuntimeException("Failed to serialize event", e);
        }
    }

    public void saveBatch(List<Event> events) {
        // DynamoDB batch limit is 25
        for (int i = 0; i < events.size(); i += 25) {
            List<Event> batch = events.subList(i, Math.min(i + 25, events.size()));
            List<WriteRequest> writeRequests = batch.stream()
                    .map(this::createWriteRequest)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (!writeRequests.isEmpty()) {
                try {
                    dynamoDbClient.batchWriteItem(BatchWriteItemRequest.builder()
                            .requestItems(Map.of(eventsTable, writeRequests))
                            .build());
                } catch (Exception e) {
                    log.error("Error batch writing events: {}", e.getMessage());
                }
            }
        }
    }

    private WriteRequest createWriteRequest(Event event) {
        try {
            String dataJson = objectMapper.writeValueAsString(event);
            String cityKey = event.getVenueCity().toLowerCase().replace(" ", "_");

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("PK", AttributeValue.builder().s("EVENT#" + event.getId()).build());
            item.put("SK", AttributeValue.builder().s("EVENT#" + event.getId()).build());
            item.put("GSI1PK", AttributeValue.builder().s("CITY#" + cityKey).build());
            item.put("GSI1SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("GSI2PK", AttributeValue.builder().s("CATEGORY#" + event.getCategory().getValue()).build());
            item.put("GSI2SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("GSI3PK", AttributeValue.builder().s("VENUE#" + event.getVenueId()).build());
            item.put("GSI3SK", AttributeValue.builder().s("DATE#" + event.getLocalDate() + "#EVENT#" + event.getId()).build());
            item.put("entityType", AttributeValue.builder().s("EVENT").build());
            item.put("data", AttributeValue.builder().s(dataJson).build());

            return WriteRequest.builder()
                    .putRequest(PutRequest.builder().item(item).build())
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error creating write request for event {}: {}", event.getId(), e.getMessage());
            return null;
        }
    }

    private Event parseEvent(Map<String, AttributeValue> item) {
        try {
            AttributeValue dataAttr = item.get("data");
            if (dataAttr == null) {
                log.warn("Event item has no 'data' attribute");
                return null;
            }

            // Handle both String type (new Java format) and Map type (TypeScript format)
            if (dataAttr.s() != null) {
                // Data stored as JSON string
                String json = dataAttr.s();
                return objectMapper.readValue(json, Event.class);
            } else if (dataAttr.m() != null && !dataAttr.m().isEmpty()) {
                // Data stored as DynamoDB Map (from TypeScript DynamoDBDocumentClient)
                Map<String, Object> dataMap = convertAttributeMapToJavaMap(dataAttr.m());
                return objectMapper.convertValue(dataMap, Event.class);
            } else {
                log.warn("Event 'data' attribute is neither String nor Map");
                return null;
            }
        } catch (Exception e) {
            log.error("Error parsing event: {} - {}", e.getMessage(), e.getClass().getSimpleName());
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
