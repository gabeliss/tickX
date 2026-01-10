package com.tickx.constants;

public final class DynamoDbConstants {
    
    // Table Names
    public static final String USERS_TABLE = "TickX-Users";
    public static final String LISTINGS_TABLE = "TickX-Listings";
    public static final String BIDS_TABLE = "TickX-Bids";
    public static final String TRANSACTIONS_TABLE = "TickX-Transactions";
    public static final String EVENTS_TABLE = "TickX-Events";
    public static final String VENUES_TABLE = "TickX-Venues";
    
    // GSI Index Names
    public static final String SELLER_CREATED_AT_INDEX = "sellerId-createdAt-index";
    public static final String EVENT_CREATED_AT_INDEX = "eventId-createdAt-index";
    public static final String STATUS_CREATED_AT_INDEX = "status-createdAt-index";
    public static final String LISTING_CREATED_AT_INDEX = "listingId-createdAt-index";
    public static final String BIDDER_CREATED_AT_INDEX = "bidderId-createdAt-index";
    public static final String BUYER_CREATED_AT_INDEX = "buyerId-createdAt-index";
    
    // Status Values
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_ENDED = "ended";
    public static final String STATUS_SOLD = "sold";
    public static final String STATUS_CANCELLED = "cancelled";
    
    // Listing Types
    public static final String LISTING_TYPE_AUCTION = "auction";
    public static final String LISTING_TYPE_FIXED = "fixed";
    public static final String LISTING_TYPE_HYBRID = "hybrid";
    public static final String LISTING_TYPE_DECLINING = "declining";
    
    // Bid Status
    public static final String BID_STATUS_ACTIVE = "active";
    public static final String BID_STATUS_OUTBID = "outbid";
    public static final String BID_STATUS_WON = "won";
    public static final String BID_STATUS_WITHDRAWN = "withdrawn";
    
    private DynamoDbConstants() {
        // Utility class - prevent instantiation
    }
}