package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {
    private String id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String stateCode;
    private String country;
    private String countryCode;
    private String postalCode;
    private String timezone;
    private Double latitude;
    private Double longitude;
    private Integer capacity;
    private String imageUrl;
    private String url;
    private String parkingInfo;
    private String boxOfficeInfo;
    private String generalInfo;

    // DynamoDB metadata
    private String createdAt;
    private String updatedAt;
    private String source;
}
