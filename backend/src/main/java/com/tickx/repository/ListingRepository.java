package com.tickx.repository;

import com.tickx.model.Listing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.List;
import java.util.Optional;

import static com.tickx.constants.DynamoDbConstants.*;

@Repository
@RequiredArgsConstructor
public class ListingRepository {

    private final DynamoDbEnhancedClient dynamoDbClient;

    private DynamoDbTable<Listing> getTable() {
        return dynamoDbClient.table(LISTINGS_TABLE, software.amazon.awssdk.enhanced.dynamodb.TableSchema.fromBean(Listing.class));
    }

    public Listing save(Listing listing) {
        getTable().putItem(listing);
        return listing;
    }

    public Optional<Listing> findById(String listingId) {
        Key key = Key.builder().partitionValue(listingId).build();
        return Optional.ofNullable(getTable().getItem(key));
    }

    public List<Listing> findBySellerId(String sellerId) {
        DynamoDbIndex<Listing> index = getTable().index(SELLER_CREATED_AT_INDEX);
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
            Key.builder().partitionValue(sellerId).build()
        );
        return index.query(queryConditional).stream()
            .flatMap(page -> page.items().stream())
            .toList();
    }

    public List<Listing> findByEventId(String eventId) {
        DynamoDbIndex<Listing> index = getTable().index(EVENT_CREATED_AT_INDEX);
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
            Key.builder().partitionValue(eventId).build()
        );
        return index.query(queryConditional).stream()
            .flatMap(page -> page.items().stream())
            .toList();
    }

    public List<Listing> findByStatus(String status) {
        DynamoDbIndex<Listing> index = getTable().index(STATUS_CREATED_AT_INDEX);
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
            Key.builder().partitionValue(status).build()
        );
        return index.query(queryConditional).stream()
            .flatMap(page -> page.items().stream())
            .toList();
    }

    public void deleteById(String listingId) {
        Key key = Key.builder().partitionValue(listingId).build();
        getTable().deleteItem(key);
    }
}