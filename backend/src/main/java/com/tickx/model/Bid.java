package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

import static com.tickx.constants.DynamoDbConstants.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class Bid {
    private String bidId;
    private String listingId;
    private String bidderId;
    private Double amount;
    private Double maxAmount; // For proxy bidding
    private Integer quantity;
    private String status; // active, outbid, won, withdrawn
    private String createdAt;

    @DynamoDbPartitionKey
    public String getBidId() {
        return bidId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = LISTING_CREATED_AT_INDEX)
    public String getListingId() {
        return listingId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = BIDDER_CREATED_AT_INDEX)
    public String getBidderId() {
        return bidderId;
    }

    @DynamoDbSecondarySortKey(indexNames = {LISTING_CREATED_AT_INDEX, BIDDER_CREATED_AT_INDEX})
    public String getCreatedAt() {
        return createdAt;
    }
}