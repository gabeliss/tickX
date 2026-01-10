package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.tickx.constants.HttpConstants;
import com.tickx.handler.base.BaseLambdaHandler;
import com.tickx.model.Event;
import com.tickx.repository.EventRepository;
import com.tickx.util.ResponseUtil;

import java.util.List;

public class EventsHandler extends BaseLambdaHandler {

    private static EventRepository eventRepository;

    static {
        eventRepository = applicationContext.getBean(EventRepository.class);
    }

    @Override
    protected APIGatewayProxyResponseEvent processRequest(APIGatewayProxyRequestEvent input, Context context) throws Exception {
        String httpMethod = input.getHttpMethod();

        if (HttpConstants.GET.equals(httpMethod)) {
            String eventId = getPathParameter(input, HttpConstants.EVENT_ID_PATH);
            
            if (eventId != null) {
                // GET /events/{eventId}
                return eventRepository.findById(eventId)
                        .map(ResponseUtil::createSuccessResponse)
                        .orElse(ResponseUtil.createNotFoundResponse("Event not found"));
            } else {
                // GET /events
                String city = getQueryParameter(input, HttpConstants.CITY_PARAM, HttpConstants.DEFAULT_CITY);
                String category = getQueryParameter(input, HttpConstants.CATEGORY_PARAM);
                String keyword = getQueryParameter(input, HttpConstants.KEYWORD_PARAM);
                int pageSize = getQueryParameterAsInt(input, HttpConstants.PAGE_SIZE_PARAM, HttpConstants.DEFAULT_PAGE_SIZE);
                
                List<Event> events = getEvents(keyword, category, city, pageSize);
                return ResponseUtil.createSuccessResponse(events);
            }
        }
        
        return ResponseUtil.createMethodNotAllowedResponse();
    }

    private List<Event> getEvents(String keyword, String category, String city, int pageSize) {
        if (keyword != null && !keyword.isEmpty()) {
            return eventRepository.searchByKeyword(keyword, city, category, pageSize);
        } else if (category != null && !category.isEmpty()) {
            return eventRepository.findByCategory(category, null, null, pageSize, null);
        } else {
            return eventRepository.findByCity(city, null, null, pageSize, null);
        }
    }
}