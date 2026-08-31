package com.axelcrm.dto;

import java.util.UUID;

public record WhatsAppStatusResponse(UUID integrationId, String status, String qrCode, String instanceId) { }
