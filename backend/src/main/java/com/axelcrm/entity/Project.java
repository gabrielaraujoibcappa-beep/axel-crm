package com.axelcrm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.axelcrm.commons.entity.BaseEntity;
import com.axelcrm.auth.entity.User;

/**
 * Client project after a proposal is approved.
 */
@Entity
@Table(name = "projects")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseEntity {

    // V9 adds the canonical `name` column while retaining the legacy `title` column.
    // ProjectRequest/ProjectService populate this property as `name`, so it must be
    // persisted to the non-null column used by the current schema.
    @Column(name = "name", nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(precision = 15, scale = 2)
    private BigDecimal cost;

    @Column(nullable = false)
    private String status = "PLANEJAMENTO";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "source_proposal_id")
    private UUID sourceProposalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "legal_process_id")
    private LegalProcess legalProcess;

    @Column(name = "cnj_number", length = 50)
    private String cnjNumber;

    @Column(name = "expert_type", length = 50)
    private String expertType;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "delivery_deadline")
    private LocalDate deliveryDeadline;
}
