package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamoDbBean
public class User {
    private String userId;
    private String email;
    private String name;
    private String phone;
    private String avatarUrl;
    private String verificationLevel; // unverified, email_verified, id_verified, trusted_seller
    private Double rating;
    private Integer totalSales;
    private Integer totalPurchases;
    private String createdAt;
    private String updatedAt;

    @DynamoDbPartitionKey
    public String getUserId() {
        return userId;
    }
}