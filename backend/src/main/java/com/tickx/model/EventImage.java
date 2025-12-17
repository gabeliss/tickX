package com.tickx.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventImage {
    private String url;
    private int width;
    private int height;
    private String ratio;
    private Boolean fallback;
}
