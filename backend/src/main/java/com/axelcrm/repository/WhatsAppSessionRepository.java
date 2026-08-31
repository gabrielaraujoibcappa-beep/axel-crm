package com.axelcrm.repository;

import com.axelcrm.entity.WhatsAppSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WhatsAppSessionRepository extends JpaRepository<WhatsAppSession, UUID> {
    Optional<WhatsAppSession> findByIntegration_IdAndOrganization_IdAndDeletedAtIsNull(UUID integrationId, UUID organizationId);
}
