package com.tickx.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.tickx.service.TicketmasterSyncService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Map;

public class SyncHandler implements RequestHandler<Map<String, Object>, String> {

    private static ConfigurableApplicationContext applicationContext;
    private static TicketmasterSyncService syncService;

    static {
        System.setProperty("spring.main.web-application-type", "none");
        applicationContext = SpringApplication.run(com.tickx.TickXApplication.class);
        syncService = applicationContext.getBean(TicketmasterSyncService.class);
    }

    @Override
    public String handleRequest(Map<String, Object> input, Context context) {
        try {
            context.getLogger().log("Starting scheduled Ticketmaster sync...");
            
            var result = syncService.sync();
            
            context.getLogger().log("Scheduled sync completed successfully");
            
            return "Sync completed: " + result.totalEventsSaved + " events, " + result.totalVenuesSaved + " venues";

        } catch (Exception e) {
            context.getLogger().log("Scheduled sync error: " + e.getMessage());
            throw new RuntimeException("Sync failed: " + e.getMessage(), e);
        }
    }
}