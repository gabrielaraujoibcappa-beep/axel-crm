package com.axelcrm.repository;

import com.axelcrm.entity.Client;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    Page<Client> findByOrganization_IdAndDeletedAtIsNull(UUID orgId, Pageable pageable);

    Optional<Client> findByIdAndOrganization_Id(UUID id, UUID orgId);

    Optional<Client> findByPhoneAndOrganization_IdAndDeletedAtIsNull(String phone, UUID orgId);

    long countByOrganization_IdAndDeletedAtIsNull(UUID orgId);

    Page<Client> findByAssignedTo_IdAndOrganization_Id(UUID userId, UUID orgId, Pageable pageable);

    java.util.List<Client> findByEmailAndOrganization_Id(String email, UUID orgId);
}
