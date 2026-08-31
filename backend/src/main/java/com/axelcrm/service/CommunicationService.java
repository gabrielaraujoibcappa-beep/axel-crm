package com.axelcrm.service;

import com.axelcrm.dto.MessageRequest;
import com.axelcrm.dto.MessageResponse;
import com.axelcrm.entity.Client;
import com.axelcrm.entity.Lead;
import com.axelcrm.entity.Message;
import com.axelcrm.auth.entity.User;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.repository.ClientRepository;
import com.axelcrm.repository.LeadRepository;
import com.axelcrm.repository.MessageRepository;
import com.axelcrm.repository.IntegrationRepository;
import com.axelcrm.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service managing multi-channel communication history logs.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CommunicationService {

    private final MessageRepository messageRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final IntegrationRepository integrationRepository;

    public Page<MessageResponse> findAll(UUID organizationId, Pageable pageable) {
        return messageRepository.findByOrganization_IdAndDeletedAtIsNull(organizationId, pageable)
                .map(this::toResponse);
    }

    public Page<MessageResponse> findByLeadId(UUID organizationId, UUID leadId, Pageable pageable) {
        return messageRepository.findByLead_IdAndOrganization_IdAndDeletedAtIsNull(leadId, organizationId, pageable)
                .map(this::toResponse);
    }

    public Page<MessageResponse> findByClientId(UUID organizationId, UUID clientId, Pageable pageable) {
        return messageRepository.findByClient_IdAndOrganization_IdAndDeletedAtIsNull(clientId, organizationId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public MessageResponse create(UUID organizationId, MessageRequest request) {
        Message message = new Message();

        if (request.leadId() != null) {
            Lead lead = leadRepository.findByIdAndOrganization_Id(request.leadId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead", "id", request.leadId()));
            message.setLead(lead);
        }

        if (request.clientId() != null) {
            Client client = clientRepository.findByIdAndOrganization_Id(request.clientId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.clientId()));
            message.setClient(client);
        }

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.userId()));
            message.setUser(user);
        }

        message.setChannel(request.channel());
        message.setDirection(request.direction());
        message.setSender(request.sender());
        message.setRecipient(request.recipient());
        message.setSubject(request.subject());
        message.setBody(request.body());
        message.setStatus(request.status() != null ? request.status() : "SENT");
        message.setWaMessageId(request.waMessageId());
        message.setRead(request.isRead() == null || request.isRead());
        if (request.integrationId() != null) {
            message.setIntegration(integrationRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(request.integrationId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Integration", "id", request.integrationId())));
        }
        message.setSentAt(LocalDateTime.now());

        message = messageRepository.save(message);
        return toResponse(message);
    }

    @Transactional
    public void delete(UUID organizationId, UUID id) {
        Message message = messageRepository.findById(id)
                .filter(m -> m.getOrganization().getId().equals(organizationId) && m.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getLead() != null ? message.getLead().getId() : null,
                message.getClient() != null ? message.getClient().getId() : null,
                message.getUser() != null ? message.getUser().getId() : null,
                message.getChannel(),
                message.getDirection(),
                message.getSender(),
                message.getRecipient(),
                message.getSubject(),
                message.getBody(),
                message.getStatus(),
                message.getWaMessageId(),
                message.isRead(),
                message.getIntegration() != null ? message.getIntegration().getId() : null,
                message.getSentAt(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}
