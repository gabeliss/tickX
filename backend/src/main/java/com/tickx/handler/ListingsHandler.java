package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.tickx.constants.HttpConstants;
import com.tickx.handler.base.BaseLambdaHandler;
import com.tickx.model.Listing;
import com.tickx.service.ListingService;
import com.tickx.util.ResponseUtil;

import java.util.List;
import java.util.Map;

public class ListingsHandler extends BaseLambdaHandler {

    private static ListingService listingService;

    static {
        listingService = applicationContext.getBean(ListingService.class);
    }

    @Override
    protected APIGatewayProxyResponseEvent processRequest(APIGatewayProxyRequestEvent input, Context context) throws Exception {
        String httpMethod = input.getHttpMethod();

        return switch (httpMethod) {
            case HttpConstants.GET -> handleGet(input);
            case HttpConstants.POST -> handlePost(input);
            case HttpConstants.PUT -> handlePut(input);
            case HttpConstants.DELETE -> handleDelete(input);
            default -> ResponseUtil.createMethodNotAllowedResponse();
        };
    }

    private APIGatewayProxyResponseEvent handleGet(APIGatewayProxyRequestEvent input) {
        String listingId = getPathParameter(input, HttpConstants.LISTING_ID_PATH);
        
        if (listingId != null) {
            // GET /listings/{listingId}
            return listingService.getListingById(listingId)
                    .map(ResponseUtil::createSuccessResponse)
                    .orElse(ResponseUtil.createNotFoundResponse("Listing not found"));
        } else {
            // GET /listings with query parameters
            String sellerId = getQueryParameter(input, HttpConstants.SELLER_ID_PARAM);
            String eventId = getQueryParameter(input, HttpConstants.EVENT_ID_PARAM);
            String status = getQueryParameter(input, HttpConstants.STATUS_PARAM);
            
            List<Listing> listings = getListings(sellerId, eventId, status);
            return ResponseUtil.createSuccessResponse(listings);
        }
    }

    private APIGatewayProxyResponseEvent handlePost(APIGatewayProxyRequestEvent input) throws Exception {
        String body = input.getBody();
        if (body == null || body.isEmpty()) {
            return ResponseUtil.createBadRequestResponse("Request body is required");
        }
        
        Listing newListing = objectMapper.readValue(body, Listing.class);
        Listing created = listingService.createListing(newListing);
        return ResponseUtil.createSuccessResponse(created);
    }

    private APIGatewayProxyResponseEvent handlePut(APIGatewayProxyRequestEvent input) throws Exception {
        String listingId = getPathParameter(input, HttpConstants.LISTING_ID_PATH);
        if (listingId == null) {
            return ResponseUtil.createBadRequestResponse("Listing ID is required");
        }
        
        String body = input.getBody();
        if (body == null || body.isEmpty()) {
            return ResponseUtil.createBadRequestResponse("Request body is required");
        }
        
        Listing updateData = objectMapper.readValue(body, Listing.class);
        updateData.setListingId(listingId);
        
        try {
            Listing updated = listingService.updateListing(listingId, updateData);
            return ResponseUtil.createSuccessResponse(updated);
        } catch (RuntimeException e) {
            return ResponseUtil.createNotFoundResponse("Listing not found");
        }
    }

    private APIGatewayProxyResponseEvent handleDelete(APIGatewayProxyRequestEvent input) {
        String listingId = getPathParameter(input, HttpConstants.LISTING_ID_PATH);
        if (listingId == null) {
            return ResponseUtil.createBadRequestResponse("Listing ID is required");
        }
        
        listingService.deleteListing(listingId);
        return ResponseUtil.createSuccessResponse(Map.of("message", "Listing deleted successfully"));
    }

    private List<Listing> getListings(String sellerId, String eventId, String status) {
        if (sellerId != null) {
            return listingService.getListingsBySeller(sellerId);
        } else if (eventId != null) {
            return listingService.getListingsByEvent(eventId);
        } else if (status != null) {
            return listingService.getListingsByStatus(status);
        } else {
            return List.of(); // Return empty list for now
        }
    }
}