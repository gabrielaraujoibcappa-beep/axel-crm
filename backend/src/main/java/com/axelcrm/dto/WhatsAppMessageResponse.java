package com.axelcrm.dto;

import com.axelcrm.entity.enums.MessageDirection;
import java.time.LocalDateTime;
import java.util.UUID;

public record WhatsAppMessageResponse(UUID id, String phone, String body, MessageDirection direction,
        String status, String waMessageId, boolean isRead, LocalDateTime sentAt) { }
