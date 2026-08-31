package com.axelcrm.service.whatsapp;

import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.dto.WhatsAppStatusResponse;
import com.axelcrm.entity.Integration;
import com.axelcrm.repository.IntegrationRepository;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/** Selects the adapter from Integration.provider so callers do not depend on a vendor. */
@Service
@Primary
@RequiredArgsConstructor
public class WhatsAppGatewayRouter implements WhatsAppGatewayService {
    private final IntegrationRepository integrations;
    private final EvolutionProvider evolution;
    private final OpenWAProvider openwa;

    private WhatsAppGatewayService provider(UUID id) {
        Integration i = integrations.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));
        return switch (i.getProvider().toLowerCase()) {
            case "evolution", "evolution-api" -> evolution;
            case "openwa", "open-wa" -> openwa;
            default -> throw new IllegalArgumentException("Unsupported WhatsApp provider: " + i.getProvider());
        };
    }
    @Override public WhatsAppStatusResponse connect(UUID id) { return provider(id).connect(id); }
    @Override public WhatsAppStatusResponse status(UUID id) { return provider(id).status(id); }
    @Override public String sendText(UUID integrationId, String to, String body) { return provider(integrationId).sendText(integrationId, to, body); }
    @Override public void disconnect(UUID id) { provider(id).disconnect(id); }
    @Override public Map<String, Object> mapWebhook(String payload) { return evolution.mapWebhook(payload); }
}
