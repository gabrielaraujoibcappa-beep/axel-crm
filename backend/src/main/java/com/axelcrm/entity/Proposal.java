package com.axelcrm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import com.axelcrm.entity.enums.LeadSource;
import com.axelcrm.entity.enums.ProposalStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.axelcrm.commons.entity.BaseEntity;
import com.axelcrm.auth.entity.User;

/**
 * Commercial proposal sent to a client.
 */
@Entity
@Table(name = "proposals")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Proposal extends BaseEntity {

    @Column(name = "proposal_code", length = 50)
    private String proposalCode;

    @Column(name = "public_token")
    private UUID publicToken;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProposalStatus status = ProposalStatus.DRAFT;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @OneToMany(mappedBy = "proposal")
    private List<ProposalItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capture_user_id")
    private User captureUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_user_id")
    private User sellerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collaborator_user_id")
    private User collaboratorUser;

    @Column(name = "capture_rate", precision = 5, scale = 4)
    private BigDecimal captureRate;

    @Column(name = "seller_rate", precision = 5, scale = 4)
    private BigDecimal sellerRate;

    @Column(name = "partner_rate", precision = 5, scale = 4)
    private BigDecimal partnerRate;

    @Column(name = "collaborator_rate", precision = 5, scale = 4)
    private BigDecimal collaboratorRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id")
    private Deal deal;

    /** Advogado vinculado ao caso, escolhido entre os contatos cadastrados. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_contact_id")
    private Contact lawyerContact;

    /** Nome do advogado quando ele ainda nao existe no cadastro de contatos. */
    @Column(name = "lawyer_name", length = 200)
    private String lawyerName;

    /** Origem da indicacao. Quem indicou continua sendo o parceiro/indicador. */
    @Enumerated(EnumType.STRING)
    @Column(name = "referral_source", length = 50)
    private LeadSource referralSource;

    /** Perito responsavel pelo trabalho. Nao participa do rateio de comissao. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_user_id")
    private User expertUser;

    /** Responsavel tecnico pelo trabalho. Nao participa do rateio de comissao. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_manager_user_id")
    private User technicalManagerUser;

    /** Projeto existente vinculado a esta proposta. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    /** Nome do advogado para exibicao: o do contato vinculado ou o texto livre. */
    public String resolveLawyerName() {
        if (lawyerContact != null && lawyerContact.getName() != null) {
            return lawyerContact.getName();
        }
        return lawyerName;
    }
}
