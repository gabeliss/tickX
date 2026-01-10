package com.tickx.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class DynamoClient {

    private final software.amazon.awssdk.services.dynamodb.DynamoDbClient dynamoDbClient;
    private final ObjectMapper objectMapper;

    public Optional<Map<String, AttributeValue>> getItem(String tableName, Map<String, AttributeValue> key) {
        try {
            GetItemResponse response = dynamoDbClient.getItem(GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build());

            return response.hasItem() && !response.item().isEmpty() 
                ? Optional.of(response.item()) 
                : Optional.empty();
        } catch (Exception e) {
            log.error("Error getting item from {}: {}", tableName, e.getMessage());
            return Optional.empty();
        }
    }

    public List<Map<String, AttributeValue>> query(String tableName, String indexName, 
            String keyCondition, Map<String, AttributeValue> values, int limit, 
            Map<String, AttributeValue> lastKey) {
        try {
            QueryRequest.Builder builder = QueryRequest.builder()
                    .tableName(tableName)
                    .keyConditionExpression(keyCondition)
                    .expressionAttributeValues(values)
                    .limit(limit);

            if (indexName != null) {
                builder.indexName(indexName);
            }
            if (lastKey != null) {
                builder.exclusiveStartKey(lastKey);
            }

            QueryResponse response = dynamoDbClient.query(builder.build());
            return response.items();
        } catch (Exception e) {
            log.error("Error querying {}: {}", tableName, e.getMessage());
            return List.of();
        }
    }

    public List<Map<String, AttributeValue>> scan(String tableName, String filterExpression, 
            Map<String, AttributeValue> values) {
        try {
            List<Map<String, AttributeValue>> allItems = new ArrayList<>();
            Map<String, AttributeValue> lastKey = null;

            do {
                ScanRequest.Builder builder = ScanRequest.builder()
                        .tableName(tableName);
                
                if (filterExpression != null) {
                    builder.filterExpression(filterExpression)
                           .expressionAttributeValues(values);
                }
                if (lastKey != null) {
                    builder.exclusiveStartKey(lastKey);
                }

                ScanResponse response = dynamoDbClient.scan(builder.build());
                allItems.addAll(response.items());
                lastKey = response.lastEvaluatedKey();
            } while (lastKey != null && !lastKey.isEmpty());

            return allItems;
        } catch (Exception e) {
            log.error("Error scanning {}: {}", tableName, e.getMessage());
            return List.of();
        }
    }

    public void putItem(String tableName, Map<String, AttributeValue> item) {
        try {
            dynamoDbClient.putItem(PutItemRequest.builder()
                    .tableName(tableName)
                    .item(item)
                    .build());
        } catch (Exception e) {
            log.error("Error putting item to {}: {}", tableName, e.getMessage());
            throw new RuntimeException("Failed to put item", e);
        }
    }

    public void batchWrite(String tableName, List<WriteRequest> writeRequests) {
        // DynamoDB batch limit is 25
        for (int i = 0; i < writeRequests.size(); i += 25) {
            List<WriteRequest> batch = writeRequests.subList(i, Math.min(i + 25, writeRequests.size()));
            try {
                dynamoDbClient.batchWriteItem(BatchWriteItemRequest.builder()
                        .requestItems(Map.of(tableName, batch))
                        .build());
            } catch (Exception e) {
                log.error("Error batch writing to {}: {}", tableName, e.getMessage());
            }
        }
    }

    public String encodeCursor(Map<String, AttributeValue> lastKey) {
        try {
            Map<String, String> simplified = lastKey.entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().s()));
            return Base64.getEncoder().encodeToString(objectMapper.writeValueAsBytes(simplified));
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, AttributeValue> decodeCursor(String cursor) {
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