package com.axelcrm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record WhatsAppMessageRequest(@NotBlank String body, UUID integrationId) { }
