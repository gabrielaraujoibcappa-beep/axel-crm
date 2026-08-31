package com.axelcrm.repository;

import com.axelcrm.entity.GoogleToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleTokenRepository extends JpaRepository<GoogleToken, UUID> {
    Optional<GoogleToken> findByUser_IdAndOrganization_IdAndDeletedAtIsNull(UUID userId, UUID organizationId);
}
