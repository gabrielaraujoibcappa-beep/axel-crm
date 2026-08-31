package com.axelcrm.service.whatsapp;

import com.axelcrm.dto.WhatsAppStatusResponse;
import com.axelcrm.entity.Integration;
import com.axelcrm.entity.WhatsAppSession;
import com.axelcrm.repository.IntegrationRepository;
import com.axelcrm.repository.WhatsAppSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service("evolutionWhatsAppProvider")
@Slf4j
public class EvolutionProvider extends GatewaySupport implements WhatsAppGatewayService {

    /** Motor exigido pelo campo obrigatorio "integration" do /instance/create na Evolution 2.x. */
    private static final String BAILEYS = "WHATSAPP-BAILEYS";
    public EvolutionProvider(IntegrationRepository integrations, WhatsAppSessionRepository sessions,
                             RestClient.Builder clientBuilder, ObjectMapper mapper) { super(integrations, sessions, clientBuilder, mapper); }

    @Override @Transactional
    public WhatsAppStatusResponse connect(UUID integrationId) {
        Integration i = integration(integrationId, "evolution");
        String instance = "axel-" + i.getId();
        RestClient client = client(i, i.getWebhookUrl());
        Map<?, ?> result;
        try {
            result = post(client, "/instance/create",
                    Map.of("instanceName", instance, "qrcode", true, "integration", BAILEYS))
                    .retrieve().body(Map.class);
        } catch (HttpClientErrorException.Forbidden alreadyExists) {
            // A instancia sobrou de um connect anterior: pede um QR novo em vez de tentar recriar.
            result = client.get().uri("/instance/connect/{name}", instance).retrieve().body(Map.class);
        }
        return save(session(i), "CONNECTING", qrCode(result), instance);
    }

    @Override @Transactional
    public WhatsAppStatusResponse status(UUID integrationId) {
        Integration i = integration(integrationId, "evolution");
        WhatsAppSession stored = sessions.findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(i.getId(), i.getOrganization().getId()).orElse(null);
        if (stored == null) return new WhatsAppStatusResponse(i.getId(), "DISCONNECTED", null, null);

        // A sessao gravada so avanca de CONNECTING para CONNECTED se o gateway confirmar:
        // o pareamento acontece no celular, sem passar pelo CRM.
        String remote = connectionState(i, stored.getInstanceId());
        if (remote == null) return new WhatsAppStatusResponse(i.getId(), stored.getStatus(), stored.getQrcode(), stored.getInstanceId());
        boolean connected = "open".equalsIgnoreCase(remote);
        return save(stored, connected ? "CONNECTED" : statusFor(remote), connected ? null : stored.getQrcode(), stored.getInstanceId());
    }

    /** Estado da instancia no gateway, ou null quando ele nao responde (mantem o ultimo conhecido). */
    private String connectionState(Integration i, String instance) {
        if (instance == null) return null;
        try {
            Map<?, ?> body = client(i, i.getWebhookUrl()).get().uri("/instance/connectionState/{name}", instance).retrieve().body(Map.class);
            Object node = body == null ? null : body.get("instance");
            return node instanceof Map<?, ?> m && m.get("state") != null ? String.valueOf(m.get("state")) : null;
        } catch (RestClientException unreachable) {
            log.warn("whatsapp_connection_state_unavailable instance={} reason={}", instance, unreachable.getMessage());
            return null;
        }
    }

    /** Evolution usa open/connecting/close; o CRM fala CONNECTED/CONNECTING/DISCONNECTED. */
    private String statusFor(String remoteState) {
        return "connecting".equalsIgnoreCase(remoteState) ? "CONNECTING" : "DISCONNECTED";
    }

    @Override public String sendText(UUID integrationId, String toPhone, String body) {
        Integration i = integration(integrationId, "evolution");
        Map<?, ?> result = post(client(i, i.getWebhookUrl()), "/message/sendText/axel-" + i.getId(), Map.of("number", toPhone, "text", body)).retrieve().body(Map.class);
        return text(result, "key", text(result, "id", UUID.randomUUID().toString()));
    }

    @Override @Transactional
    public void disconnect(UUID integrationId) { Integration i = integration(integrationId, "evolution"); sessions.findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(i.getId(), i.getOrganization().getId()).ifPresent(s -> save(s, "DISCONNECTED", null, s.getInstanceId())); }
    @Override public Map<String, Object> mapWebhook(String payload) { return map(payload); }

    /**
     * Evolution 2.x devolve o QR aninhado: {"qrcode":{"base64":"data:image/png;base64,...","code":"2@..."}}.
     * O base64 e o que a tela renderiza; o code serve como fallback textual.
     */
    private String qrCode(Map<?, ?> result) {
        if (result == null) return null;
        Object node = result.get("qrcode");
        if (node != null && !(node instanceof Map)) return String.valueOf(node);
        // /instance/create aninha o QR em "qrcode"; /instance/connect devolve os campos na raiz.
        Map<?, ?> qr = node instanceof Map<?, ?> nested ? nested : result;
        Object base64 = qr.get("base64");
        if (base64 != null) return String.valueOf(base64);
        Object code = qr.get("code");
        return code == null ? null : String.valueOf(code);
    }

    private String text(Map<?, ?> m, String key, String fallback) { Object v = m == null ? null : m.get(key); return v instanceof Map<?, ?> nested ? text(nested, "id", fallback) : v == null ? fallback : String.valueOf(v); }
}
