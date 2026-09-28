package com.korainc.conformia_api.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record
ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fields
) {

    public record FieldError(String field, String message) {
    }

    public static ErrorResponse of(OffsetDateTime timestamp, int status, String error,
                                   String message, String path) {
        return new ErrorResponse(timestamp, status, error, message, path, null);
    }
}
