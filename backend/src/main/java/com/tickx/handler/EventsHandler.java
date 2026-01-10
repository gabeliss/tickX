package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.model.Event;
import com.tickx.repository.EventRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EventsHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static ConfigurableApplicationContext applicationContext;
    private static EventRepository eventRepository;
    private static ObjectMapper objectMapper = new ObjectMapper();

    static {
        System.setProperty("spring.main.web-application-type", "none");
        applicationContext = SpringApplication.run(com.tickx.TickXApplication.class);
        eventRepository = applicationContext.getBean(EventRepository.class);
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String httpMethod = input.getHttpMethod();
            String path = input.getPath();
            Map<String, String> pathParameters = input.getPathParameters();
            Map<String, String> queryParameters = input.getQueryStringParameters();

            if ("GET".equals(httpMethod)) {
                if (pathParameters != null && pathParameters.containsKey("eventId")) {
                    // GET /events/{eventId}
                    String eventId = pathParameters.get("eventId");
                    return eventRepository.findById(eventId)
                            .map(this::createSuccessResponse)
                            .orElse(createErrorResponse(404, "Event not found"));
                } else {
                    // GET /events
                    String city = queryParameters != null ? queryParameters.get("city") : "chicago";
                    String category = queryParameters != null ? queryParameters.get("category") : null;
                    String keyword = queryParameters != null ? queryParameters.get("keyword") : null;
                    int pageSize = queryParameters != null && queryParameters.get("pageSize") != null 
                            ? Integer.parseInt(queryParameters.get("pageSize")) : 20;
                    
                    List<Event> events;
                    if (keyword != null && !keyword.isEmpty()) {
                        events = eventRepository.searchByKeyword(keyword, city, category, pageSize);
                    } else if (category != null && !category.isEmpty()) {
                        events = eventRepository.findByCategory(category, null, null, pageSize, null);
                    } else {
                        events = eventRepository.findByCity(city, null, null, pageSize, null);
                    }
                    
                    return createSuccessResponse(events);
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