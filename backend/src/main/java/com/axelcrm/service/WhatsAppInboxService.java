package com.axelcrm.service;

import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.dto.*;
import com.axelcrm.entity.*;
import com.axelcrm.entity.enums.*;
import com.axelcrm.repository.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WhatsAppInboxService {
    private final MessageRepository messages;
    private final IntegrationRepository integrations;
    private final com.axelcrm.service.whatsapp.WhatsAppGatewayService gateway;
    private final LeadRepository leads;
    private final ClientRepository clients;

    public List<ConversationSummary> conversations(UUID org) {
        Map<String, List<Message>> grouped = messages.findByOrganization_IdAndChannelAndDeletedAtIsNullOrderBySentAtDesc(org, MessageChannel.WHATSAPP)
            .stream().collect(Collectors.groupingBy(this::phone));
        return grouped.entrySet().stream().map(e -> {
            Message latest = e.getValue().stream().max(Comparator.comparing(Message::getSentAt)).orElseThrow();
            return summary(org, e.getKey(), e.getValue(), latest);
        }).sorted(Comparator.comparing(ConversationSummary::lastMessageAt).reversed()).toList();
    }

    public Page<WhatsAppMessageResponse> conversation(UUID org, String phone, Pageable pageable) {
        List<Message> all = messages.findByOrganization_IdAndChannelAndDeletedAtIsNullOrderBySentAtDesc(org, MessageChannel.WHATSAPP)
            .stream().filter(m -> phone.equals(phone(m))).sorted(Comparator.comparing(Message::getSentAt).reversed()).toList();
        int from = Math.min((int) pageable.getOffset(), all.size());
        int to = Math.min(from + pageable.getPageSize(), all.size());
        return new PageImpl<>(all.subList(from, to).stream().map(this::response).toList(), pageable, all.size());
    }

    @Transactional
    public WhatsAppMessageResponse send(UUID org, String phone, WhatsAppMessageRequest request) {
        Integration integration = integration(org, request.integrationId());
        String waId = gateway.sendText(integration.getId(), phone, request.body());
        Message message = new Message(); message.setChannel(MessageChannel.WHATSAPP); message.setDirection(MessageDirection.OUTBOUND);
        message.setSender("me"); message.setRecipient(phone); message.setBody(request.body()); message.setStatus("SENT"); message.setRead(true);
        message.setWaMessageId(waId); message.setIntegration(integration); message.setSentAt(LocalDateTime.now());
        return response(messages.save(message));
    }

    @Transactional
    public boolean receive(UUID org, Integration integration, String waId, String from, String to, String body) {
        if (waId != null && messages.findByWaMessageId(waId).isPresent()) return false;
        TenantContext.setOrganizationId(org);
        try {
            Message message = new Message(); message.setChannel(MessageChannel.WHATSAPP); message.setDirection(MessageDirection.INBOUND);
            message.setSender(from); message.setRecipient(to); message.setBody(body); message.setStatus("RECEIVED"); message.setRead(false);
            message.setWaMessageId(waId); message.setIntegration(integration); message.setSentAt(LocalDateTime.now()); messages.save(message); return true;
        } finally { TenantContext.clear(); }
    }

    @Transactional public void markRead(UUID org, UUID id) {
        Message message = messages.findByIdAndOrganization_IdAndDeletedAtIsNull(id, org).orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        message.setRead(true); messages.save(message);
    }

    @Transactional
    public void markConversationRead(UUID org, String phone) {
        messages.findByOrganization_IdAndChannelAndDeletedAtIsNullOrderBySentAtDesc(org, MessageChannel.WHATSAPP)
            .stream().filter(m -> phone.equals(phone(m)) && m.getDirection() == MessageDirection.INBOUND && !m.isRead())
            .forEach(m -> m.setRead(true));
    }

    @Transactional
    public ConversationSummary linkConversation(UUID org, String phone, WhatsAppConversationLinkRequest request) {
        String type = request.type().toUpperCase(Locale.ROOT);
        List<Message> conversation = conversationMessages(org, phone);
        if (conversation.isEmpty()) throw new ResourceNotFoundException("WhatsApp conversation", "phone", phone);

        String label;
        if ("LEAD".equals(type)) {
            Lead lead = leads.findByIdAndOrganization_Id(request.id(), org).filter(l -> l.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Lead", "id", request.id()));
            conversation.forEach(m -> { m.setLead(lead); m.setClient(null); });
            label = lead.getName();
        } else if ("CLIENT".equals(type)) {
            Client client = clients.findByIdAndOrganization_Id(request.id(), org).filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.id()));
            conversation.forEach(m -> { m.setClient(client); m.setLead(null); });
            label = client.getName();
        } else {
            throw new IllegalArgumentException("WhatsApp link type must be LEAD or CLIENT");
        }
        messages.saveAll(conversation);
        return conversationSummary(org, phone, conversation);
    }

    @Transactional
    public ConversationSummary unlinkConversation(UUID org, String phone) {
        List<Message> conversation = conversationMessages(org, phone);
        conversation.forEach(m -> { m.setLead(null); m.setClient(null); });
        messages.saveAll(conversation);
        return conversationSummary(org, phone, conversation);
    }

    /**
     * An organization with no WhatsApp integration is DISCONNECTED, not missing.
     * Throwing 404 here would be indistinguishable from "endpoint not deployed"
     * and pushes the inbox UI into its demo fallback for a legitimate setup state.
     */
    public WhatsAppStatusResponse status(UUID org, UUID integrationId) {
        Integration integration;
        try {
            integration = integration(org, integrationId);
        } catch (ResourceNotFoundException ex) {
            if (integrationId != null) throw ex;
            return new WhatsAppStatusResponse(null, "DISCONNECTED", null, null);
        }
        return gateway.status(integration.getId());
    }
    public WhatsAppStatusResponse connect(UUID org, UUID integrationId) { return gateway.connect(integration(org, integrationId).getId()); }
    @Transactional public void disconnect(UUID org, UUID integrationId) { gateway.disconnect(integration(org, integrationId).getId()); }

    public Integration integration(UUID org, UUID id) {
        if (id != null) return integrations.findByIdAndOrganization_IdAndDeletedAtIsNull(id, org).orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));
        return integrations.findByOrganization_IdAndDeletedAtIsNull(org, PageRequest.of(0, 20)).getContent().stream().filter(i -> i.isActive() && i.getProvider().toLowerCase().contains("evolution")).findFirst().orElseThrow(() -> new ResourceNotFoundException("WhatsApp integration"));
    }

    private String phone(Message m) { return m.getDirection() == MessageDirection.INBOUND ? m.getSender() : m.getRecipient(); }
    private WhatsAppMessageResponse response(Message m) { return new WhatsAppMessageResponse(m.getId(), phone(m), m.getBody(), m.getDirection(), m.getStatus(), m.getWaMessageId(), m.isRead(), m.getSentAt()); }

    private List<Message> conversationMessages(UUID org, String phone) {
        return messages.findByOrganization_IdAndChannelAndDeletedAtIsNullOrderBySentAtDesc(org, MessageChannel.WHATSAPP)
            .stream().filter(m -> phone.equals(phone(m))).toList();
    }

    private ConversationSummary conversationSummary(UUID org, String phone, List<Message> conversation) {
        if (conversation.isEmpty()) return new ConversationSummary(phone, contactName(org, phone), null, null, 0, null, null, null);
        Message latest = conversation.stream().max(Comparator.comparing(Message::getSentAt)).orElseThrow();
        return summary(org, phone, conversation, latest);
    }

    private ConversationSummary summary(UUID org, String phone, List<Message> conversation, Message latest) {
        Message linked = conversation.stream().filter(m -> m.getLead() != null || m.getClient() != null).findFirst().orElse(null);
        String linkedType = linked == null ? null : linked.getLead() != null ? "LEAD" : "CLIENT";
        UUID linkedId = linked == null ? null : linked.getLead() != null ? linked.getLead().getId() : linked.getClient().getId();
        String linkedLabel = linked == null ? null : linked.getLead() != null ? linked.getLead().getName() : linked.getClient().getName();
        String contactName = linkedLabel != null ? linkedLabel : contactName(org, phone);
        return new ConversationSummary(phone, contactName, latest.getBody(), latest.getSentAt(),
            conversation.stream().filter(m -> !m.isRead() && m.getDirection() == MessageDirection.INBOUND).count(),
            linkedType, linkedId, linkedLabel);
    }

    private String contactName(UUID org, String phone) {
        return leads.findByPhoneAndOrganization_IdAndDeletedAtIsNull(phone, org).map(Lead::getName)
            .or(() -> clients.findByPhoneAndOrganization_IdAndDeletedAtIsNull(phone, org).map(Client::getName))
            .orElse(phone);
    }
}
