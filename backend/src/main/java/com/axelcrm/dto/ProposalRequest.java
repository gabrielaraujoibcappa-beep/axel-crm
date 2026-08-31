package com.axelcrm.dto;

import com.axelcrm.entity.enums.LeadSource;
import com.axelcrm.entity.enums.ProposalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for creating or updating a Proposal.
 */
public record ProposalRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 4000) String description,
    ProposalStatus status,
    LocalDate issueDate,
    LocalDate validUntil,
    BigDecimal totalAmount,
    BigDecimal discountAmount,
    @NotNull UUID clientId,
    UUID assignedToUserId,
    UUID partnerId,
    List<ProposalItemRequest> items,
    UUID captureUserId,
    UUID sellerUserId,
    UUID collaboratorUserId,
    BigDecimal captureRate,
    BigDecimal sellerRate,
    BigDecimal partnerRate,
    BigDecimal collaboratorRate,
    UUID dealId,

    /** Advogado vinculado, escolhido entre os contatos cadastrados. */
    UUID lawyerContactId,
    /** Nome do advogado quando ele ainda nao existe no cadastro de contatos. */
    @Size(max = 200) String lawyerName,
    /** Origem da indicacao. Quem indicou continua sendo o partnerId. */
    LeadSource referralSource,
    /** Perito responsavel. Nao participa do rateio de comissao. */
    UUID expertUserId,
    /** Responsavel tecnico. Nao participa do rateio de comissao. */
    UUID technicalManagerUserId,
    /** Projeto existente a vincular a esta proposta. */
    UUID projectId
) {
    public ProposalRequest(
        String title, String description, ProposalStatus status, LocalDate issueDate,
        LocalDate validUntil, BigDecimal totalAmount, BigDecimal discountAmount, UUID clientId,
        UUID assignedToUserId, UUID partnerId, List<ProposalItemRequest> items
    ) {
        this(title, description, status, issueDate, validUntil, totalAmount, discountAmount, clientId, assignedToUserId, partnerId, items, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    /** Backward-compatible constructor used by existing callers that do not send a total. */
    public ProposalRequest(
        String title, String description, ProposalStatus status, LocalDate issueDate,
        LocalDate validUntil, BigDecimal discountAmount, UUID clientId,
        UUID assignedToUserId, UUID partnerId, List<ProposalItemRequest> items
    ) {
        this(title, description, status, issueDate, validUntil, null, discountAmount, clientId,
                assignedToUserId, partnerId, items, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    /** Backward-compatible constructor for callers created before the legal/expert fields. */
    public ProposalRequest(
        String title, String description, ProposalStatus status, LocalDate issueDate,
        LocalDate validUntil, BigDecimal totalAmount, BigDecimal discountAmount, UUID clientId,
        UUID assignedToUserId, UUID partnerId, List<ProposalItemRequest> items,
        UUID captureUserId, UUID sellerUserId, UUID collaboratorUserId,
        BigDecimal captureRate, BigDecimal sellerRate, BigDecimal partnerRate,
        BigDecimal collaboratorRate, UUID dealId
    ) {
        this(title, description, status, issueDate, validUntil, totalAmount, discountAmount, clientId,
                assignedToUserId, partnerId, items, captureUserId, sellerUserId, collaboratorUserId,
                captureRate, sellerRate, partnerRate, collaboratorRate, dealId,
                null, null, null, null, null, null);
    }
}
