package com.axelcrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for creating or updating a CalendarEvent.
 */
public record CalendarEventRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 4000) String description,
    @NotNull LocalDateTime startTime,
    @NotNull LocalDateTime endTime,
    boolean allDay,
    @Size(max = 500) String location,
    /** Optional: when omitted, the authenticated user owns the event. */
    UUID userId,
    UUID leadId,
    UUID clientId,
    UUID dealId
) {
}
