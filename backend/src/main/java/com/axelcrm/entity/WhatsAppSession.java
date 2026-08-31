package com.axelcrm.entity;

import com.axelcrm.commons.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "whatsapp_sessions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class WhatsAppSession extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "integration_id")
    private Integration integration;
    @Column(nullable = false)
    private String status = "DISCONNECTED";
    private String qrcode;
    @Column(name = "instance_id")
    private String instanceId;
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
}
