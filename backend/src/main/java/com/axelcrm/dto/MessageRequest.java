package com.axelcrm.dto;

import com.axelcrm.entity.enums.MessageChannel;
import com.axelcrm.entity.enums.MessageDirection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request payload for creating a multi-channel message record.
 */
public record MessageRequest(
    UUID leadId,
    UUID clientId,
    UUID userId,

    @NotNull(message = "Message channel is required")
    MessageChannel channel,

    @NotNull(message = "Message direction is required")
    MessageDirection direction,

    @NotBlank(message = "Sender is required")
    String sender,

    @NotBlank(message = "Recipient is required")
    String recipient,

    String subject,

    @NotBlank(message = "Message body is required")
    String body,

    String status,

    String waMessageId,

    Boolean isRead,

    UUID integrationId
) {
}
