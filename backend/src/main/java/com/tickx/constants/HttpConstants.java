package com.tickx.constants;

public final class HttpConstants {
    
    // HTTP Methods
    public static final String GET = "GET";
    public static final String POST = "POST";
    public static final String PUT = "PUT";
    public static final String DELETE = "DELETE";
    
    // HTTP Status Codes
    public static final int OK = 200;
    public static final int BAD_REQUEST = 400;
    public static final int NOT_FOUND = 404;
    public static final int METHOD_NOT_ALLOWED = 405;
    public static final int INTERNAL_SERVER_ERROR = 500;
    
    // Headers
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String APPLICATION_JSON = "application/json";
    public static final String ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    public static final String ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods";
    public static final String ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
    public static final String CORS_ALL_ORIGINS = "*";
    public static final String CORS_ALLOWED_METHODS = "GET,POST,PUT,DELETE";
    public static final String CORS_ALLOWED_HEADERS = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token";
    
    // Query Parameters
    public static final String CITY_PARAM = "city";
    public static final String CATEGORY_PARAM = "category";
    public static final String KEYWORD_PARAM = "keyword";
    public static final String PAGE_SIZE_PARAM = "pageSize";
    public static final String SELLER_ID_PARAM = "sellerId";
    public static final String EVENT_ID_PARAM = "eventId";
    public static final String STATUS_PARAM = "status";
    
    // Path Parameters
    public static final String EVENT_ID_PATH = "eventId";
    public static final String VENUE_ID_PATH = "venueId";
    public static final String LISTING_ID_PATH = "listingId";
    
    // Default Values
    public static final String DEFAULT_CITY = "chicago";
    public static final int DEFAULT_PAGE_SIZE = 20;
    
    private HttpConstants() {
        // Utility class - prevent instantiation
    }
}