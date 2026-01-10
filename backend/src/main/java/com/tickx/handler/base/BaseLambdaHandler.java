package com.tickx.handler.base;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tickx.TickXApplication;
import com.tickx.util.ResponseUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Map;

public abstract class BaseLambdaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    protected static ConfigurableApplicationContext applicationContext;
    protected static ObjectMapper objectMapper = new ObjectMapper();

    static {
        System.setProperty("spring.main.web-application-type", "none");
        applicationContext = SpringApplication.run(TickXApplication.class);
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            return processRequest(input, context);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseUtil.createErrorResponse(500, "Internal Server Error: " + e.getMessage());
        }
    }

    protected abstract APIGatewayProxyResponseEvent processRequest(APIGatewayProxyRequestEvent input, Context context) throws Exception;

    protected String getPathParameter(APIGatewayProxyRequestEvent input, String paramName) {
        Map<String, String> pathParameters = input.getPathParameters();
        return pathParameters != null ? pathParameters.get(paramName) : null;
    }

    protected String getQueryParameter(APIGatewayProxyRequestEvent input, String paramName) {
        Map<String, String> queryParameters = input.getQueryStringParameters();
        return queryParameters != null ? queryParameters.get(paramName) : null;
    }

    protected String getQueryParameter(APIGatewayProxyRequestEvent input, String paramName, String defaultValue) {
        String value = getQueryParameter(input, paramName);
        return value != null ? value : defaultValue;
    }

    protected int getQueryParameterAsInt(APIGatewayProxyRequestEvent input, String paramName, int defaultValue) {
        String value = getQueryParameter(input, paramName);
        if (value != null) {
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }
}