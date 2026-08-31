package com.axelcrm.controller;

import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.entity.Integration;
import com.axelcrm.repository.IntegrationRepository;
import com.axelcrm.service.WhatsAppInboxService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/whatsapp/webhook")
@RequiredArgsConstructor
public class WhatsAppWebhookController {
    private final IntegrationRepository integrations;
    private final WhatsAppInboxService inbox;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/{integrationId}")
    public ResponseEntity<Void> receive(@PathVariable UUID integrationId, @RequestHeader(value = "X-Webhook-Secret", required = false) String secret, @RequestBody String payload) throws Exception {
        Integration integration = integrations.findById(integrationId).orElse(null);
        if (integration == null || integration.getDeletedAt() != null || !validSecret(integration, secret)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        JsonNode root = mapper.readTree(payload);
        String waId = text(root, "wa_message_id", text(root, "id", null));
        String from = text(root, "from", text(root, "sender", "unknown"));
        String to = text(root, "to", text(root, "recipient", "whatsapp"));
        String body = text(root, "body", text(root, "text", ""));
        TenantContext.setOrganizationId(integration.getOrganization().getId());
        try { inbox.receive(integration.getOrganization().getId(), integration, waId, from, to, body); }
        finally { TenantContext.clear(); }
        return ResponseEntity.accepted().build();
    }

    private boolean validSecret(Integration i, String supplied) {
        // Placeholder validation: production should verify the provider signature/HMAC.
        return i.getApiKey() == null || i.getApiKey().isBlank() || i.getApiKey().equals(supplied);
    }
    private String text(JsonNode node, String key, String fallback) { JsonNode value = node.get(key); return value == null || value.isNull() ? fallback : value.asText(); }
}
