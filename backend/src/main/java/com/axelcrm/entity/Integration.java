package com.axelcrm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.axelcrm.commons.entity.BaseEntity;
import com.axelcrm.config.EncryptedStringConverter;

/**
 * External service configuration for an organization.
 */
@Entity
@Table(name = "integrations")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Integration extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String provider;

    @Column(columnDefinition = "TEXT")
    @jakarta.persistence.Convert(converter = EncryptedStringConverter.class)
    private String credentials;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "api_key")
    @jakarta.persistence.Convert(converter = EncryptedStringConverter.class)
    private String apiKey;

    @Column(nullable = false)
    private boolean active = false;

    @Column(name = "last_sync_at")
    private java.time.LocalDateTime lastSyncAt;
}
