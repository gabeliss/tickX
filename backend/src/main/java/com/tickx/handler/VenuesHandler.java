package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.model.Venue;
import com.tickx.repository.VenueRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VenuesHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ConfigurableApplicationContext applicationContext;
    private static VenueRepository venueRepository;
    private static ObjectMapper objectMapper = new ObjectMapper();

    static {
        System.setProperty("spring.main.web-application-type", "none");
        applicationContext = SpringApplication.run(com.tickx.TickXApplication.class);
        venueRepository = applicationContext.getBean(VenueRepository.class);
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String httpMethod = input.getHttpMethod();
            Map<String, String> pathParameters = input.getPathParameters();
            Map<String, String> queryParameters = input.getQueryStringParameters();

            if ("GET".equals(httpMethod)) {
                if (pathParameters != null && pathParameters.containsKey("venueId")) {
                    // GET /venues/{venueId}
                    String venueId = pathParameters.get("venueId");
                    return venueRepository.findById(venueId)
                            .map(this::createSuccessResponse)
                            .orElse(createErrorResponse(404, "Venue not found"));
                } else {
                    // GET /venues
                    String city = queryParameters != null ? queryParameters.get("city") : "chicago";
                    int pageSize = queryParameters != null && queryParameters.get("pageSize") != null 
                            ? Integer.parseInt(queryParameters.get("pageSize")) : 50;
                    
                    List<Venue> venues = venueRepository.findByCity(city, pageSize, null);
                    return createSuccessResponse(venues);
                }
            }
            
            return createErrorResponse(404, "Not Found");

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