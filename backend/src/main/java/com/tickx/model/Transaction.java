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
public class Transaction {
    private String transactionId;
    private String listingId;
    private String sellerId;
    private String buyerId;
    private Double amount;
    private Double buyerFee;
    private Double sellerFee;
    private String status; // pending_payment, paid, transfer_pending, completed, refunded
    private String paymentIntentId;
    private String transferConfirmedAt;
    private String createdAt;
    private String completedAt;

    @DynamoDbPartitionKey
    public String getTransactionId() {
        return transactionId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = SELLER_CREATED_AT_INDEX)
    public String getSellerId() {
        return sellerId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = BUYER_CREATED_AT_INDEX)
    public String getBuyerId() {
        return buyerId;
    }

    @DynamoDbSecondarySortKey(indexNames = {SELLER_CREATED_AT_INDEX, BUYER_CREATED_AT_INDEX})
    public String getCreatedAt() {
        return createdAt;
    }
}