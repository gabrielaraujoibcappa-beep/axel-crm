package com.axelcrm.repository;

import com.axelcrm.entity.Integration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Integration entities.
 */
public interface IntegrationRepository extends JpaRepository<Integration, UUID> {

    Optional<Integration> findByIdAndOrganization_IdAndDeletedAtIsNull(UUID id, UUID organizationId);

    Optional<Integration> findByIdAndDeletedAtIsNull(UUID id);

    Page<Integration> findByOrganization_IdAndDeletedAtIsNull(UUID organizationId, Pageable pageable);
}
