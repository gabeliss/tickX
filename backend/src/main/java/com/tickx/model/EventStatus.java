package com.tickx.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EventStatus {
    SCHEDULED("scheduled"),
    POSTPONED("postponed"),
    CANCELLED("cancelled"),
    RESCHEDULED("rescheduled");

    private final String value;

    EventStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EventStatus fromValue(String value) {
        if (value == null) return SCHEDULED;
        for (EventStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        return SCHEDULED;
    }

    public static EventStatus fromTicketmasterStatus(String tmStatus) {
        if (tmStatus == null) return SCHEDULED;
        return switch (tmStatus.toLowerCase()) {
            case "cancelled" -> CANCELLED;
            case "postponed" -> POSTPONED;
            case "rescheduled" -> RESCHEDULED;
            default -> SCHEDULED;
        };
    }
}
