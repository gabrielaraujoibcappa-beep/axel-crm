package com.axelcrm.service.whatsapp;

import com.axelcrm.dto.WhatsAppStatusResponse;
import com.axelcrm.entity.Integration;
import com.axelcrm.repository.IntegrationRepository;
import com.axelcrm.repository.WhatsAppSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service("openWaWhatsAppProvider")
public class OpenWAProvider extends GatewaySupport implements WhatsAppGatewayService {
    public OpenWAProvider(IntegrationRepository i, WhatsAppSessionRepository s, RestClient.Builder b, ObjectMapper m) { super(i, s, b, m); }
    @Override @Transactional public WhatsAppStatusResponse connect(UUID id) { Integration i = integration(id, "openwa"); return save(session(i), "CONNECTING", null, "axel-" + i.getId()); }
    @Override @Transactional(readOnly = true) public WhatsAppStatusResponse status(UUID id) { Integration i = integration(id, "openwa"); return sessions.findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(id, i.getOrganization().getId()).map(s -> new WhatsAppStatusResponse(id, s.getStatus(), s.getQrcode(), s.getInstanceId())).orElse(new WhatsAppStatusResponse(id, "DISCONNECTED", null, null)); }
    @Override public String sendText(UUID integrationId, String to, String body) { Integration i = integration(integrationId, "openwa"); return String.valueOf(post(client(i, i.getWebhookUrl()), "/sendText", Map.of("phone", to, "message", body)).retrieve().body(Map.class).getOrDefault("id", UUID.randomUUID().toString())); }
    @Override @Transactional public void disconnect(UUID id) { Integration i = integration(id, "openwa"); sessions.findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(id, i.getOrganization().getId()).ifPresent(s -> save(s, "DISCONNECTED", null, s.getInstanceId())); }
    @Override public Map<String, Object> mapWebhook(String payload) { return map(payload); }
}
