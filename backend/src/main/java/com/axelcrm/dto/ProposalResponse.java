package com.axelcrm.dto;

import com.axelcrm.entity.enums.LeadSource;
import com.axelcrm.entity.enums.ProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.axelcrm.auth.dto.UserResponse;

/**
 * DTO for Proposal responses.
 */
public record ProposalResponse(
    UUID id,
    String proposalCode,
    UUID publicToken,
    String title,
    String description,
    ProposalStatus status,
    LocalDate issueDate,
    LocalDate validUntil,
    BigDecimal totalAmount,
    BigDecimal discountAmount,
    LocalDateTime approvedAt,
    ClientResponse client,
    UserResponse assignedTo,
    List<ProposalItemResponse> items,
    UserResponse captureUser,
    UserResponse sellerUser,
    PartnerResponse partner,
    UserResponse collaboratorUser,
    BigDecimal captureRate,
    BigDecimal sellerRate,
    BigDecimal partnerRate,
    BigDecimal collaboratorRate,
    UUID dealId,

    /** Advogado vinculado, quando escolhido no cadastro de contatos. */
    UUID lawyerContactId,
    /** Nome do advogado: o do contato vinculado ou o texto livre informado. */
    String lawyerName,
    /** Origem da indicacao. Quem indicou e o partner. */
    LeadSource referralSource,
    /** Perito responsavel. Nao participa do rateio de comissao. */
    UserResponse expertUser,
    /** Responsavel tecnico. Nao participa do rateio de comissao. */
    UserResponse technicalManagerUser,
    /** Projeto vinculado a esta proposta. */
    UUID projectId,
    String projectName,

    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public ProposalResponse(
        UUID id, String title, String description, ProposalStatus status,
        LocalDate issueDate, LocalDate validUntil, BigDecimal totalAmount,
        BigDecimal discountAmount, LocalDateTime approvedAt, ClientResponse client,
        UserResponse assignedTo, List<ProposalItemResponse> items,
        LocalDateTime createdAt, LocalDateTime updatedAt
    ) {
        this(id, null, null, title, description, status, issueDate, validUntil, totalAmount, discountAmount, approvedAt, client, assignedTo, items, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, createdAt, updatedAt);
    }
}
