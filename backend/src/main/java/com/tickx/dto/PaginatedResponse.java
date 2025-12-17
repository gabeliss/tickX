package com.tickx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> data;
    private Pagination pagination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pagination {
        private int page;
        private int pageSize;
        private int totalItems;
        private int totalPages;
        private boolean hasMore;
        private String cursor;
    }

    public static <T> PaginatedResponse<T> of(List<T> data, int pageSize, boolean hasMore, String cursor) {
        return PaginatedResponse.<T>builder()
                .data(data)
                .pagination(Pagination.builder()
                        .page(0)
                        .pageSize(pageSize)
                        .totalItems(data.size())
                        .totalPages(1)
                        .hasMore(hasMore)
                        .cursor(cursor)
                        .build())
                .build();
    }
}
