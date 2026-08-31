package com.axelcrm.repository;

import com.axelcrm.entity.Message;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.axelcrm.entity.enums.MessageChannel;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for {@link Message} entities.
 */
public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByOrganization_IdAndDeletedAtIsNull(UUID organizationId, Pageable pageable);

    Page<Message> findByLead_IdAndOrganization_IdAndDeletedAtIsNull(
        UUID leadId, UUID organizationId, Pageable pageable);

    Page<Message> findByClient_IdAndOrganization_IdAndDeletedAtIsNull(
        UUID clientId, UUID organizationId, Pageable pageable);

    List<Message> findByOrganization_IdAndChannelAndDeletedAtIsNullOrderBySentAtDesc(
        UUID organizationId, MessageChannel channel);

    Optional<Message> findByWaMessageId(String waMessageId);

    Optional<Message> findByIdAndOrganization_IdAndDeletedAtIsNull(UUID id, UUID organizationId);
}
