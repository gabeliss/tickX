package com.tickx.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EventCategory {
    CONCERT("concert"),
    SPORTS("sports"),
    THEATER("theater"),
    FESTIVAL("festival"),
    COMEDY("comedy"),
    OTHER("other");

    private final String value;

    EventCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EventCategory fromValue(String value) {
        if (value == null) return OTHER;
        for (EventCategory category : values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        return OTHER;
    }

    public static EventCategory fromTicketmasterSegment(String segment) {
        if (segment == null) return OTHER;
        return switch (segment) {
            case "Music" -> CONCERT;
            case "Sports" -> SPORTS;
            case "Arts & Theatre" -> THEATER;
            case "Comedy" -> COMEDY;
            case "Festival" -> FESTIVAL;
            default -> OTHER;
        };
    }
}
