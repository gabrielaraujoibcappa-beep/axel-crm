package com.axelcrm.service.whatsapp;

import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.dto.WhatsAppStatusResponse;
import com.axelcrm.entity.Integration;
import com.axelcrm.entity.WhatsAppSession;
import com.axelcrm.repository.IntegrationRepository;
import com.axelcrm.repository.WhatsAppSessionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

abstract class GatewaySupport {
    protected final IntegrationRepository integrations;
    protected final WhatsAppSessionRepository sessions;
    protected final RestClient.Builder clientBuilder;
    protected final ObjectMapper mapper;

    GatewaySupport(IntegrationRepository integrations, WhatsAppSessionRepository sessions,
                   RestClient.Builder clientBuilder, ObjectMapper mapper) {
        this.integrations = integrations;
        this.sessions = sessions;
        this.clientBuilder = clientBuilder;
        this.mapper = mapper;
    }

    protected Integration integration(UUID id, String provider) {
        Integration i = integrations.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));
        if (!provider.equalsIgnoreCase(i.getProvider()))
            throw new IllegalArgumentException("Integration provider is not " + provider);
        return i;
    }

    protected WhatsAppSession session(Integration i) {
        return sessions.findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(i.getId(), i.getOrganization().getId())
                .orElseGet(() -> { WhatsAppSession s = new WhatsAppSession(); s.setIntegration(i); s.setOrganization(i.getOrganization()); return s; });
    }

    protected WhatsAppStatusResponse save(WhatsAppSession s, String status, String qr, String instance) {
        s.setStatus(status); s.setQrcode(qr); s.setInstanceId(instance); s.setLastSeenAt(LocalDateTime.now());
        s = sessions.save(s);
        return new WhatsAppStatusResponse(s.getIntegration().getId(), s.getStatus(), s.getQrcode(), s.getInstanceId());
    }

    protected Map<String, Object> map(String payload) {
        try { return mapper.readValue(payload, new TypeReference<>() {}); }
        catch (Exception e) { throw new IllegalArgumentException("Invalid WhatsApp webhook payload", e); }
    }

    protected RestClient client(Integration i, String baseUrl) {
        return clientBuilder.baseUrl(baseUrl).defaultHeader("apikey", i.getApiKey() == null ? "" : i.getApiKey()).build();
    }
    protected RestClient.RequestHeadersSpec<?> post(RestClient client, String path, Object body) {
        return client.post().uri(path).contentType(MediaType.APPLICATION_JSON).body(body);
    }
}
