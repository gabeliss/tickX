package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

import java.util.List;

import static com.tickx.constants.DynamoDbConstants.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class Listing {
    private String listingId;
    private String sellerId;
    private String eventId;
    private String listingType; // auction, fixed, hybrid, declining
    private String status; // active, ended, sold, cancelled
    private String section;
    private String row;
    private List<String> seats;
    private Integer quantity;
    
    // Pricing
    private Double startingPrice;
    private Double currentPrice;
    private Double buyNowPrice;
    private Double reservePrice;
    private Double floorPrice;
    
    // Auction specifics
    private Integer bidCount;
    private String auctionEndTime;
    private Boolean reserveMet;
    
    // Configuration
    private Boolean allowSplitting;
    private Integer minQuantity;
    private Double bidIncrement;
    
    // Metadata
    private Integer watcherCount;
    private Integer viewCount;
    private String createdAt;
    private String updatedAt;

    @DynamoDbPartitionKey
    public String getListingId() {
        return listingId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = SELLER_CREATED_AT_INDEX)
    public String getSellerId() {
        return sellerId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = EVENT_CREATED_AT_INDEX)
    public String getEventId() {
        return eventId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = STATUS_CREATED_AT_INDEX)
    public String getStatus() {
        return status;
    }

    @DynamoDbSecondarySortKey(indexNames = {SELLER_CREATED_AT_INDEX, EVENT_CREATED_AT_INDEX, STATUS_CREATED_AT_INDEX})
    public String getCreatedAt() {
        return createdAt;
    }
}