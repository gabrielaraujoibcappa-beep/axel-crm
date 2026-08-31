package com.axelcrm.dto;

import com.axelcrm.entity.enums.MessageChannel;
import com.axelcrm.entity.enums.MessageDirection;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response payload representing a communication history record.
 */
public record MessageResponse(
    UUID id,
    UUID leadId,
    UUID clientId,
    UUID userId,
    MessageChannel channel,
    MessageDirection direction,
    String sender,
    String recipient,
    String subject,
    String body,
    String status,
    String waMessageId,
    boolean isRead,
    UUID integrationId,
    LocalDateTime sentAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
