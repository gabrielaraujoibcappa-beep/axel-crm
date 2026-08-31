package com.axelcrm.repository;

import com.axelcrm.entity.Lead;
import com.axelcrm.entity.enums.LeadSource;
import com.axelcrm.entity.enums.LeadStage;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for {@link Lead} entities.
 */
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    Page<Lead> findByOrganization_IdAndDeletedAtIsNull(UUID orgId, Pageable pageable);

    java.util.List<Lead> findByOrganization_IdAndDeletedAtIsNull(UUID orgId);

    Optional<Lead> findByIdAndOrganization_Id(UUID id, UUID orgId);

    Optional<Lead> findByPhoneAndOrganization_IdAndDeletedAtIsNull(String phone, UUID orgId);

    long countByOrganization_IdAndDeletedAtIsNull(UUID orgId);

    long countByStageAndOrganization_Id(LeadStage stage, UUID orgId);

    Page<Lead> findBySourceAndOrganization_Id(LeadSource source, UUID orgId, Pageable pageable);

    Page<Lead> findByAssignedTo_IdAndOrganization_Id(UUID userId, UUID orgId, Pageable pageable);

    java.util.List<Lead> findByEmailAndOrganization_Id(String email, UUID orgId);

    long countByPartner_IdAndOrganization_IdAndDeletedAtIsNull(UUID partnerId, UUID orgId);
}
