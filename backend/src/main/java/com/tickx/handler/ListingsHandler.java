package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.model.Listing;
import com.tickx.service.ListingService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ListingsHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ConfigurableApplicationContext applicationContext;
    private static ListingService listingService;
    private static ObjectMapper objectMapper = new ObjectMapper();

    static {
        System.setProperty("spring.main.web-application-type", "none");
        applicationContext = SpringApplication.run(com.tickx.TickXApplication.class);
        listingService = applicationContext.getBean(ListingService.class);
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String httpMethod = input.getHttpMethod();
            Map<String, String> pathParameters = input.getPathParameters();
            Map<String, String> queryParameters = input.getQueryStringParameters();

            switch (httpMethod) {
                case "GET":
                    if (pathParameters != null && pathParameters.containsKey("listingId")) {
                        // GET /listings/{listingId}
                        String listingId = pathParameters.get("listingId");
                        return listingService.getListingById(listingId)
                                .map(this::createSuccessResponse)
                                .orElse(createErrorResponse(404, "Listing not found"));
                    } else {
                        // GET /listings
                        String sellerId = queryParameters != null ? queryParameters.get("sellerId") : null;
                        String eventId = queryParameters != null ? queryParameters.get("eventId") : null;
                        String status = queryParameters != null ? queryParameters.get("status") : null;
                        
                        List<Listing> listings;
                        if (sellerId != null) {
                            listings = listingService.getListingsBySeller(sellerId);
                        } else if (eventId != null) {
                            listings = listingService.getListingsByEvent(eventId);
                        } else if (status != null) {
                            listings = listingService.getListingsByStatus(status);
                        } else {
                            listings = List.of(); // Return empty list for now
                        }
                        
                        return createSuccessResponse(listings);
                    }
                    
                case "POST":
                    // POST /listings
                    String body = input.getBody();
                    if (body == null || body.isEmpty()) {
                        return createErrorResponse(400, "Request body is required");
                    }
                    
                    Listing newListing = objectMapper.readValue(body, Listing.class);
                    Listing created = listingService.createListing(newListing);
                    return createSuccessResponse(created);
                    
                case "PUT":
                    if (pathParameters != null && pathParameters.containsKey("listingId")) {
                        // PUT /listings/{listingId}
                        String listingId = pathParameters.get("listingId");
                        String updateBody = input.getBody();
                        if (updateBody == null || updateBody.isEmpty()) {
                            return createErrorResponse(400, "Request body is required");
                        }
                        
                        Listing updateData = objectMapper.readValue(updateBody, Listing.class);
                        updateData.setListingId(listingId);
                        
                        try {
                            Listing updated = listingService.updateListing(listingId, updateData);
                            return createSuccessResponse(updated);
                        } catch (RuntimeException e) {
                            return createErrorResponse(404, "Listing not found");
                        }
                    }
                    return createErrorResponse(400, "Listing ID is required");
                    
                case "DELETE":
                    if (pathParameters != null && pathParameters.containsKey("listingId")) {
                        // DELETE /listings/{listingId}
                        String listingId = pathParameters.get("listingId");
                        listingService.deleteListing(listingId);
                        return createSuccessResponse(Map.of("message", "Listing deleted successfully"));
                    }
                    return createErrorResponse(400, "Listing ID is required");
                    
                default:
                    return createErrorResponse(405, "Method not allowed");
            }

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return createErrorResponse(500, "Internal Server Error: " + e.getMessage());
        }
    }

    private APIGatewayProxyResponseEvent createSuccessResponse(Object data) {
        try {
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Access-Control-Allow-Origin", "*");

            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withHeaders(headers)
                    .withBody(objectMapper.writeValueAsString(data));
        } catch (Exception e) {
            return createErrorResponse(500, "Serialization error");
        }
    }

    private APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String message) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withHeaders(headers)
                .withBody("{\"error\":\"" + message + "\"}");
    }
}