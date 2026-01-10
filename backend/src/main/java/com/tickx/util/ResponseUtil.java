package com.tickx.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.constants.HttpConstants;

import java.util.HashMap;
import java.util.Map;

public final class ResponseUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static APIGatewayProxyResponseEvent createSuccessResponse(Object data) {
        try {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(HttpConstants.OK)
                    .withHeaders(createCorsHeaders())
                    .withBody(objectMapper.writeValueAsString(data));
        } catch (Exception e) {
            return createErrorResponse(HttpConstants.INTERNAL_SERVER_ERROR, "Serialization error");
        }
    }

    public static APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String message) {
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withHeaders(createCorsHeaders())
                .withBody("{\"error\":\"" + message + "\"}");
    }

    public static APIGatewayProxyResponseEvent createNotFoundResponse(String message) {
        return createErrorResponse(HttpConstants.NOT_FOUND, message);
    }

    public static APIGatewayProxyResponseEvent createBadRequestResponse(String message) {
        return createErrorResponse(HttpConstants.BAD_REQUEST, message);
    }

    public static APIGatewayProxyResponseEvent createMethodNotAllowedResponse() {
        return createErrorResponse(HttpConstants.METHOD_NOT_ALLOWED, "Method not allowed");
    }

    private static Map<String, String> createCorsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put(HttpConstants.CONTENT_TYPE, HttpConstants.APPLICATION_JSON);
        headers.put(HttpConstants.ACCESS_CONTROL_ALLOW_ORIGIN, HttpConstants.CORS_ALL_ORIGINS);
        return headers;
    }

    private ResponseUtil() {
        // Utility class - prevent instantiation
    }
}