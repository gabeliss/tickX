package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.tickx.constants.HttpConstants;
import com.tickx.handler.base.BaseLambdaHandler;
import com.tickx.model.Venue;
import com.tickx.repository.VenueRepository;
import com.tickx.util.ResponseUtil;

import java.util.List;

public class VenuesHandler extends BaseLambdaHandler {

    private static VenueRepository venueRepository;
    private static final int DEFAULT_VENUE_PAGE_SIZE = 50;

    static {
        venueRepository = applicationContext.getBean(VenueRepository.class);
    }

    @Override
    protected APIGatewayProxyResponseEvent processRequest(APIGatewayProxyRequestEvent input, Context context) throws Exception {
        String httpMethod = input.getHttpMethod();

        if (HttpConstants.GET.equals(httpMethod)) {
            String venueId = getPathParameter(input, HttpConstants.VENUE_ID_PATH);
            
            if (venueId != null) {
                // GET /venues/{venueId}
                return venueRepository.findById(venueId)
                        .map(ResponseUtil::createSuccessResponse)
                        .orElse(ResponseUtil.createNotFoundResponse("Venue not found"));
            } else {
                // GET /venues
                String city = getQueryParameter(input, HttpConstants.CITY_PARAM, HttpConstants.DEFAULT_CITY);
                int pageSize = getQueryParameterAsInt(input, HttpConstants.PAGE_SIZE_PARAM, DEFAULT_VENUE_PAGE_SIZE);
                
                List<Venue> venues = venueRepository.findByCity(city, pageSize, null);
                return ResponseUtil.createSuccessResponse(venues);
            }
        }
        
        return ResponseUtil.createMethodNotAllowedResponse();
    }
}