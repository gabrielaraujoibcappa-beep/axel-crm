package com.axelcrm.service;

import com.axelcrm.dto.CalendarEventRequest;
import com.axelcrm.dto.CalendarEventResponse;
import com.axelcrm.entity.CalendarEvent;
import com.axelcrm.entity.Client;
import com.axelcrm.entity.Deal;
import com.axelcrm.entity.Lead;
import com.axelcrm.auth.entity.User;
import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.repository.CalendarEventRepository;
import com.axelcrm.repository.ClientRepository;
import com.axelcrm.repository.DealRepository;
import com.axelcrm.repository.LeadRepository;
import com.axelcrm.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;

    public Page<CalendarEventResponse> findAll(UUID organizationId, Pageable pageable) {
        return calendarEventRepository.findByOrganization_IdAndDeletedAtIsNull(organizationId, pageable)
                .map(this::toResponse);
    }

    public CalendarEventResponse findById(UUID organizationId, UUID id) {
        return calendarEventRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(id, organizationId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", "id", id));
    }

    @Transactional
    public CalendarEventResponse create(UUID organizationId, CalendarEventRequest request) {
        User user = resolveUser(request.userId());

        CalendarEvent event = new CalendarEvent();
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setAllDay(request.allDay());
        event.setLocation(request.location());
        event.setUser(user);

        if (request.leadId() != null) {
            Lead lead = leadRepository.findByIdAndOrganization_Id(request.leadId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead", "id", request.leadId()));
            event.setLead(lead);
        }
        if (request.clientId() != null) {
            Client client = clientRepository.findByIdAndOrganization_Id(request.clientId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.clientId()));
            event.setClient(client);
        }
        if (request.dealId() != null) {
            Deal deal = dealRepository.findByIdAndOrganization_Id(request.dealId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", request.dealId()));
            event.setDeal(deal);
        }

        event = calendarEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public CalendarEventResponse update(UUID organizationId, UUID id, CalendarEventRequest request) {
        CalendarEvent event = calendarEventRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", "id", id));

        User user = resolveUser(request.userId());

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setAllDay(request.allDay());
        event.setLocation(request.location());
        event.setUser(user);

        if (request.leadId() != null) {
            Lead lead = leadRepository.findByIdAndOrganization_Id(request.leadId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead", "id", request.leadId()));
            event.setLead(lead);
        } else {
            event.setLead(null);
        }

        if (request.clientId() != null) {
            Client client = clientRepository.findByIdAndOrganization_Id(request.clientId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.clientId()));
            event.setClient(client);
        } else {
            event.setClient(null);
        }

        if (request.dealId() != null) {
            Deal deal = dealRepository.findByIdAndOrganization_Id(request.dealId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", request.dealId()));
            event.setDeal(deal);
        } else {
            event.setDeal(null);
        }

        event = calendarEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public void delete(UUID organizationId, UUID id) {
        CalendarEvent event = calendarEventRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", "id", id));
        event.setDeletedAt(java.time.LocalDateTime.now());
        calendarEventRepository.save(event);
    }

    private User resolveUser(UUID requestedUserId) {
        UUID userId = requestedUserId != null ? requestedUserId : TenantContext.getUserId();
        if (userId == null) {
            throw new IllegalStateException("Authenticated user is required to manage calendar events");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private CalendarEventResponse toResponse(CalendarEvent event) {
        return new CalendarEventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.isAllDay(),
                event.getLocation(),
                event.getUser() != null ? event.getUser().getId() : null,
                event.getLead() != null ? event.getLead().getId() : null,
                event.getClient() != null ? event.getClient().getId() : null,
                event.getDeal() != null ? event.getDeal().getId() : null,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
