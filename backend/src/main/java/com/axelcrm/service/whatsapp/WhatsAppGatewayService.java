package com.axelcrm.service.whatsapp;

import com.axelcrm.dto.WhatsAppStatusResponse;
import java.util.Map;
import java.util.UUID;

/**
 * Contrato neutro de provedor para gateways de WhatsApp.
 *
 * <p>Todo metodo identifica a integracao por id. Resolver a integracao a partir da organizacao
 * dentro do adaptador escolheria "a primeira ativa", o que envia pelo numero errado quando a
 * organizacao tem mais de um WhatsApp conectado — a escolha pertence a quem chama.
 */
public interface WhatsAppGatewayService {
    WhatsAppStatusResponse connect(UUID integrationId);
    WhatsAppStatusResponse status(UUID integrationId);
    String sendText(UUID integrationId, String toPhone, String body);
    void disconnect(UUID integrationId);
    Map<String, Object> mapWebhook(String payload);
}
