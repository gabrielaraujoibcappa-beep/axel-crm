package com.axelcrm.service;

import com.axelcrm.dto.ProposalRequest;
import com.axelcrm.dto.ProposalResponse;
import com.axelcrm.dto.ProposalItemRequest;
import com.axelcrm.dto.ProposalItemResponse;
import com.axelcrm.dto.ClientResponse;
import com.axelcrm.auth.dto.UserResponse;
import com.axelcrm.dto.PartnerResponse;
import com.axelcrm.entity.Client;
import com.axelcrm.entity.Contact;
import com.axelcrm.entity.Partner;
import com.axelcrm.entity.Project;
import com.axelcrm.entity.Proposal;
import com.axelcrm.entity.ProposalItem;
import com.axelcrm.auth.entity.User;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.repository.ClientRepository;
import com.axelcrm.repository.PartnerRepository;
import com.axelcrm.repository.ProjectRepository;
import com.axelcrm.repository.ProposalItemRepository;
import com.axelcrm.repository.ProposalRepository;
import com.axelcrm.auth.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Element;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.axelcrm.entity.Deal;
import com.axelcrm.entity.PipelineStage;
import com.axelcrm.repository.DealRepository;
import com.axelcrm.repository.PipelineStageRepository;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProposalItemRepository proposalItemRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PartnerRepository partnerRepository;
    private final ProjectRepository projectRepository;
    private final com.axelcrm.repository.ContactRepository contactRepository;
    private final DealRepository dealRepository;
    private final PipelineStageRepository pipelineStageRepository;
    private final PipelineEngine pipelineEngine;

    public Page<ProposalResponse> findAll(UUID organizationId, Pageable pageable) {
        return proposalRepository.findByOrganization_IdAndDeletedAtIsNull(organizationId, pageable)
                .map(this::toResponse);
    }

    public ProposalResponse findById(UUID organizationId, UUID id) {
        return proposalRepository.findByIdAndOrganization_Id(id, organizationId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
    }

    @Transactional
    public ProposalResponse create(UUID organizationId, ProposalRequest request) {
        Client client = clientRepository.findByIdAndOrganization_Id(request.clientId(), organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.clientId()));

        Proposal proposal = new Proposal();
        proposal.setTitle(request.title());
        proposal.setDescription(request.description());
        proposal.setStatus(request.status() != null ? request.status() : com.axelcrm.entity.enums.ProposalStatus.DRAFT);
        proposal.setIssueDate(request.issueDate());
        proposal.setValidUntil(request.validUntil());
        proposal.setDiscountAmount(request.discountAmount() != null ? request.discountAmount() : BigDecimal.ZERO);
        proposal.setClient(client);

        LocalDateTime now = LocalDateTime.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0, 0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);
        long count = proposalRepository.countByOrganization_IdAndCreatedAtBetweenAndDeletedAtIsNull(organizationId, startOfMonth, endOfMonth);
        String proposalCode = String.format("%d.%02d.%03d", year, month, count + 1);

        proposal.setProposalCode(proposalCode);
        proposal.setPublicToken(UUID.randomUUID());

        if (request.dealId() != null) {
            proposal.setDeal(dealRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(request.dealId(), organizationId).orElse(null));
        }

        if (request.assignedToUserId() != null) {
            User assigned = userRepository.findById(request.assignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.assignedToUserId()));
            proposal.setAssignedTo(assigned);
        }

        if (request.partnerId() != null) {
            proposal.setPartner(partnerRepository.findByIdAndOrganization_Id(request.partnerId(), organizationId).orElse(null));
        }

        if (request.captureUserId() != null) {
            proposal.setCaptureUser(userRepository.findById(request.captureUserId()).orElse(null));
        }
        if (request.sellerUserId() != null) {
            proposal.setSellerUser(userRepository.findById(request.sellerUserId()).orElse(null));
        }
        if (request.collaboratorUserId() != null) {
            proposal.setCollaboratorUser(userRepository.findById(request.collaboratorUserId()).orElse(null));
        }
        proposal.setCaptureRate(request.captureRate());
        proposal.setSellerRate(request.sellerRate());
        proposal.setPartnerRate(request.partnerRate());
        proposal.setCollaboratorRate(request.collaboratorRate());

        applyLegalAndExpertFields(organizationId, proposal, request);

        BigDecimal totalAmount = request.totalAmount() != null ? request.totalAmount() : BigDecimal.ZERO;
        List<ProposalItem> items = new ArrayList<>();

        proposal = proposalRepository.save(proposal);

        if (request.items() != null) {
            totalAmount = BigDecimal.ZERO;
            for (ProposalItemRequest itemRequest : request.items()) {
                ProposalItem item = new ProposalItem();
                item.setProposal(proposal);
                item.setDescription(itemRequest.description());
                item.setQuantity(itemRequest.quantity());
                item.setUnitPrice(itemRequest.unitPrice());
                item.setDiscountAmount(itemRequest.discountAmount() != null ? itemRequest.discountAmount() : BigDecimal.ZERO);

                BigDecimal itemTotal = itemRequest.unitPrice()
                        .multiply(BigDecimal.valueOf(itemRequest.quantity()))
                        .subtract(item.getDiscountAmount());
                item.setTotal(itemTotal);

                totalAmount = totalAmount.add(itemTotal);
                items.add(proposalItemRepository.save(item));
            }
        }

        proposal.setTotalAmount(totalAmount.subtract(proposal.getDiscountAmount()));
        proposal.setItems(items);
        if (proposal.getStatus() == com.axelcrm.entity.enums.ProposalStatus.ACCEPTED) {
            proposal.setApprovedAt(LocalDateTime.now());
            proposal = proposalRepository.save(proposal);
            triggerPostApprovalActions(organizationId, proposal);
        } else {
            proposal = proposalRepository.save(proposal);
        }

        return toResponse(proposal);
    }

    @Transactional
    public ProposalResponse update(UUID organizationId, UUID id, ProposalRequest request) {
        Proposal proposal = proposalRepository.findByIdAndOrganization_Id(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));

        Client client = clientRepository.findByIdAndOrganization_Id(request.clientId(), organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", request.clientId()));

        proposal.setTitle(request.title());
        proposal.setDescription(request.description());
        if (request.status() != null) {
            proposal.setStatus(request.status());
        }
        proposal.setIssueDate(request.issueDate());
        proposal.setValidUntil(request.validUntil());
        proposal.setDiscountAmount(request.discountAmount() != null ? request.discountAmount() : BigDecimal.ZERO);
        proposal.setClient(client);

        if (request.dealId() != null) {
            proposal.setDeal(dealRepository.findByIdAndOrganization_IdAndDeletedAtIsNull(request.dealId(), organizationId).orElse(null));
        } else {
            proposal.setDeal(null);
        }

        if (request.assignedToUserId() != null) {
            User assigned = userRepository.findById(request.assignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.assignedToUserId()));
            proposal.setAssignedTo(assigned);
        } else {
            proposal.setAssignedTo(null);
        }

        if (request.partnerId() != null) {
            proposal.setPartner(partnerRepository.findByIdAndOrganization_Id(request.partnerId(), organizationId).orElse(null));
        } else {
            proposal.setPartner(null);
        }

        if (request.captureUserId() != null) {
            proposal.setCaptureUser(userRepository.findById(request.captureUserId()).orElse(null));
        } else {
            proposal.setCaptureUser(null);
        }

        if (request.sellerUserId() != null) {
            proposal.setSellerUser(userRepository.findById(request.sellerUserId()).orElse(null));
        } else {
            proposal.setSellerUser(null);
        }

        if (request.collaboratorUserId() != null) {
            proposal.setCollaboratorUser(userRepository.findById(request.collaboratorUserId()).orElse(null));
        } else {
            proposal.setCollaboratorUser(null);
        }

        proposal.setCaptureRate(request.captureRate());
        proposal.setSellerRate(request.sellerRate());
        proposal.setPartnerRate(request.partnerRate());
        proposal.setCollaboratorRate(request.collaboratorRate());

        applyLegalAndExpertFields(organizationId, proposal, request);

        // Delete existing items and recreate
        proposalItemRepository.deleteAll(proposal.getItems());

        BigDecimal totalAmount = request.totalAmount() != null ? request.totalAmount() : BigDecimal.ZERO;
        List<ProposalItem> items = new ArrayList<>();

        if (request.items() != null) {
            totalAmount = BigDecimal.ZERO;
            for (ProposalItemRequest itemRequest : request.items()) {
                ProposalItem item = new ProposalItem();
                item.setProposal(proposal);
                item.setDescription(itemRequest.description());
                item.setQuantity(itemRequest.quantity());
                item.setUnitPrice(itemRequest.unitPrice());
                item.setDiscountAmount(itemRequest.discountAmount() != null ? itemRequest.discountAmount() : BigDecimal.ZERO);

                BigDecimal itemTotal = itemRequest.unitPrice()
                        .multiply(BigDecimal.valueOf(itemRequest.quantity()))
                        .subtract(item.getDiscountAmount());
                item.setTotal(itemTotal);

                totalAmount = totalAmount.add(itemTotal);
                items.add(proposalItemRepository.save(item));
            }
        }

        proposal.setTotalAmount(totalAmount.subtract(proposal.getDiscountAmount()));
        proposal.setItems(items);

        com.axelcrm.entity.enums.ProposalStatus oldStatus = proposal.getStatus();
        if (request.status() != null) {
            proposal.setStatus(request.status());
        }

        if (proposal.getStatus() == com.axelcrm.entity.enums.ProposalStatus.ACCEPTED && oldStatus != com.axelcrm.entity.enums.ProposalStatus.ACCEPTED) {
            proposal.setApprovedAt(LocalDateTime.now());
            proposal = proposalRepository.save(proposal);
            triggerPostApprovalActions(organizationId, proposal);
        } else {
            proposal = proposalRepository.save(proposal);
        }

        return toResponse(proposal);
    }

    @Transactional
    public void delete(UUID organizationId, UUID id) {
        Proposal proposal = proposalRepository.findByIdAndOrganization_Id(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        proposal.setDeletedAt(java.time.LocalDateTime.now());
        proposalRepository.save(proposal);
    }

    private ProposalResponse toResponse(Proposal proposal) {
        List<ProposalItemResponse> items = proposal.getItems().stream()
                .map(item -> new ProposalItemResponse(
                        item.getId(),
                        item.getProposal() != null ? item.getProposal().getId() : null,
                        item.getDescription(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getDiscountAmount(),
                        item.getTotal()
                )).toList();

        ClientResponse clientResponse = null;
        if (proposal.getClient() != null) {
            Client client = proposal.getClient();
            clientResponse = new ClientResponse(
                    client.getId(), client.getName(), client.getEmail(), client.getPhone(),
                    client.getDocument(), client.getCompanyName(), client.getWebsite(),
                    client.getIndustry(), client.getAddress(), client.getCity(),
                    client.getState(), client.getZipCode(), client.getCountry(),
                    client.getNotes(),
                    client.isActive(),
                    client.getStatus(),
                    client.getServiceType(),
                    client.getAssignedTo() != null ? client.getAssignedTo().getId() : null,
                    client.getCreatedAt(), client.getUpdatedAt()
            );
        }

        UserResponse assignedToResponse = null;
        if (proposal.getAssignedTo() != null) {
            User u = proposal.getAssignedTo();
            assignedToResponse = new UserResponse(
                    u.getId(),
                    u.getName(),
                    u.getEmail(),
                    u.getRole(),
                    u.isActive(),
                    u.getOrganization() != null ? u.getOrganization().getId() : null,
                    u.getOrganization() != null ? u.getOrganization().getName() : null,
                    null,
                    u.getCreatedAt()
            );
        }

        return new ProposalResponse(
                proposal.getId(),
                proposal.getProposalCode(),
                proposal.getPublicToken(),
                proposal.getTitle(),
                proposal.getDescription(),
                proposal.getStatus(),
                proposal.getIssueDate(),
                proposal.getValidUntil(),
                proposal.getTotalAmount(),
                proposal.getDiscountAmount(),
                proposal.getApprovedAt(),
                clientResponse,
                assignedToResponse,
                items,
                mapUserToResponse(proposal.getCaptureUser()),
                mapUserToResponse(proposal.getSellerUser()),
                mapPartnerToResponse(proposal.getPartner()),
                mapUserToResponse(proposal.getCollaboratorUser()),
                proposal.getCaptureRate(),
                proposal.getSellerRate(),
                proposal.getPartnerRate(),
                proposal.getCollaboratorRate(),
                proposal.getDeal() != null ? proposal.getDeal().getId() : null,
                proposal.getLawyerContact() != null ? proposal.getLawyerContact().getId() : null,
                proposal.resolveLawyerName(),
                proposal.getReferralSource(),
                mapUserToResponse(proposal.getExpertUser()),
                mapUserToResponse(proposal.getTechnicalManagerUser()),
                proposal.getProject() != null ? proposal.getProject().getId() : null,
                proposal.getProject() != null ? proposal.getProject().getName() : null,
                proposal.getCreatedAt(),
                proposal.getUpdatedAt()
        );
    }

    public ProposalResponse findByPublicToken(UUID publicToken) {
        Proposal proposal = proposalRepository.findByPublicTokenAndDeletedAtIsNull(publicToken)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "publicToken", publicToken));
        com.axelcrm.auth.security.TenantContext.setOrganizationId(proposal.getOrganization().getId());
        return toResponse(proposal);
    }

    @Transactional
    public void convertToProject(UUID organizationId, UUID id) {
        Proposal proposal = proposalRepository.findByIdAndOrganization_Id(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        
        if (proposal.getStatus() != com.axelcrm.entity.enums.ProposalStatus.ACCEPTED) {
            throw new com.axelcrm.commons.exception.BadRequestException("A proposta precisa estar aprovada (ACCEPTED) para ser convertida em projeto.");
        }

        if (proposal.getProject() != null) {
            throw new com.axelcrm.commons.exception.BadRequestException("Esta proposta já possui um projeto vinculado.");
        }

        Project project = new Project();
        project.setName("Projeto: " + proposal.getTitle());
        project.setDescription(proposal.getDescription());
        project.setStartDate(java.time.LocalDate.now());
        project.setEndDate(java.time.LocalDate.now().plusMonths(3));
        project.setBudget(proposal.getTotalAmount());
        project.setCost(BigDecimal.ZERO);
        project.setStatus("PLANEJAMENTO");
        project.setClient(proposal.getClient());
        project.setManager(proposal.getAssignedTo());
        project.setSourceProposalId(proposal.getId());

        project = projectRepository.save(project);

        // O projeto gerado passa a ser o projeto vinculado da proposta.
        proposal.setProject(project);
        proposalRepository.save(proposal);
    }

    public byte[] generateProposalPdf(UUID organizationId, UUID id) {
        Proposal proposal = proposalRepository.findByIdAndOrganization_Id(id, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "id", id));
        return buildPdf(proposal);
    }

    public byte[] generatePublicProposalPdf(UUID publicToken) {
        Proposal proposal = proposalRepository.findByPublicTokenAndDeletedAtIsNull(publicToken)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", "publicToken", publicToken));
        com.axelcrm.auth.security.TenantContext.setOrganizationId(proposal.getOrganization().getId());
        return buildPdf(proposal);
    }

    private byte[] buildPdf(Proposal proposal) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(0, 7, 45));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(18, 52, 153));
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldTextFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            Paragraph docHeader = new Paragraph("PROPOSTA COMERCIAL", titleFont);
            docHeader.setAlignment(Element.ALIGN_CENTER);
            docHeader.setSpacingAfter(20);
            document.add(docHeader);

            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);

            metaTable.addCell(createCell("Código da Proposta:", boldTextFont, Color.WHITE, false));
            metaTable.addCell(createCell(proposal.getProposalCode() != null ? proposal.getProposalCode() : "N/A", textFont, Color.WHITE, false));
            
            metaTable.addCell(createCell("Cliente:", boldTextFont, Color.WHITE, false));
            metaTable.addCell(createCell(proposal.getClient() != null ? proposal.getClient().getName() : "N/A", textFont, Color.WHITE, false));

            metaTable.addCell(createCell("Data de Emissão:", boldTextFont, Color.WHITE, false));
            metaTable.addCell(createCell(formatDateBR(proposal.getIssueDate()), textFont, Color.WHITE, false));

            metaTable.addCell(createCell("Validade até:", boldTextFont, Color.WHITE, false));
            metaTable.addCell(createCell(formatDateBR(proposal.getValidUntil()), textFont, Color.WHITE, false));

            metaTable.addCell(createCell("Status:", boldTextFont, Color.WHITE, false));
            metaTable.addCell(createCell(translateStatus(proposal.getStatus()), textFont, Color.WHITE, false));

            document.add(metaTable);

            addCaseSection(document, proposal, subTitleFont, textFont, boldTextFont);

            if (proposal.getDescription() != null && !proposal.getDescription().isBlank()) {
                Paragraph descHeader = new Paragraph("Descrição do Escopo", subTitleFont);
                descHeader.setSpacingAfter(8);
                document.add(descHeader);

                Paragraph desc = new Paragraph(proposal.getDescription(), textFont);
                desc.setSpacingAfter(20);
                document.add(desc);
            }

            Paragraph itemsHeader = new Paragraph("Itens e Serviços Mapeados", subTitleFont);
            itemsHeader.setSpacingAfter(8);
            document.add(itemsHeader);

            PdfPTable itemsTable = new PdfPTable(4);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{4f, 1f, 1.5f, 1.5f});
            itemsTable.setSpacingAfter(20);

            Color navy = new Color(18, 52, 153);
            itemsTable.addCell(createCell("Item/Serviço", headerFont, navy, true));
            itemsTable.addCell(createCell("Qtd", headerFont, navy, true));
            itemsTable.addCell(createCell("Preço Unitário", headerFont, navy, true));
            itemsTable.addCell(createCell("Total", headerFont, navy, true));

            if (proposal.getItems() != null) {
                for (ProposalItem item : proposal.getItems()) {
                    itemsTable.addCell(createCell(item.getDescription(), textFont, Color.WHITE, true));
                    itemsTable.addCell(createCell(String.valueOf(item.getQuantity()), textFont, Color.WHITE, true));
                    itemsTable.addCell(createCell(formatCurrencyBRL(item.getUnitPrice()), textFont, Color.WHITE, true));
                    
                    BigDecimal itemTotal = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()))
                            .subtract(item.getDiscountAmount() != null ? item.getDiscountAmount() : BigDecimal.ZERO);
                    itemsTable.addCell(createCell(formatCurrencyBRL(itemTotal), textFont, Color.WHITE, true));
                }
            }

            document.add(itemsTable);

            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setSpacingAfter(40);

            totalTable.addCell(createCell("Desconto:", boldTextFont, Color.WHITE, false));
            totalTable.addCell(createCell(formatCurrencyBRL(proposal.getDiscountAmount()), textFont, Color.WHITE, false));

            totalTable.addCell(createCell("Valor Total:", boldTextFont, Color.WHITE, false));
            totalTable.addCell(createCell(formatCurrencyBRL(proposal.getTotalAmount()), boldTextFont, Color.WHITE, false));

            document.add(totalTable);

            PdfPTable signatureTable = new PdfPTable(2);
            signatureTable.setWidthPercentage(100);
            signatureTable.setSpacingBefore(30);

            PdfPCell c1 = createCell("\n\n_____________________________________\nAssinatura do Cliente", textFont, Color.WHITE, false);
            c1.setHorizontalAlignment(Element.ALIGN_CENTER);
            signatureTable.addCell(c1);

            PdfPCell c2 = createCell("\n\n_____________________________________\nAssinatura do Consultor", textFont, Color.WHITE, false);
            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
            signatureTable.addCell(c2);

            document.add(signatureTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da proposta", e);
        }
    }

    /**
     * Seção "Dados do Caso" do PDF: advogado vinculado, perito responsável e responsável
     * técnico. Só aparece quando ao menos um deles está preenchido.
     *
     * Quem indicou, origem da indicação e projeto vinculado são controle interno e ficam
     * fora do documento entregue ao cliente.
     */
    private void addCaseSection(Document document, Proposal proposal,
                                Font subTitleFont, Font textFont, Font boldTextFont) throws Exception {
        String lawyer = proposal.resolveLawyerName();
        String expert = proposal.getExpertUser() != null ? proposal.getExpertUser().getName() : null;
        String technicalManager = proposal.getTechnicalManagerUser() != null
                ? proposal.getTechnicalManagerUser().getName() : null;

        if (isBlank(lawyer) && isBlank(expert) && isBlank(technicalManager)) {
            return;
        }

        Paragraph header = new Paragraph("Dados do Caso", subTitleFont);
        header.setSpacingAfter(8);
        document.add(header);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        if (!isBlank(lawyer)) {
            table.addCell(createCell("Advogado:", boldTextFont, Color.WHITE, false));
            table.addCell(createCell(lawyer, textFont, Color.WHITE, false));
        }
        if (!isBlank(expert)) {
            table.addCell(createCell("Perito Responsável:", boldTextFont, Color.WHITE, false));
            table.addCell(createCell(expert, textFont, Color.WHITE, false));
        }
        if (!isBlank(technicalManager)) {
            table.addCell(createCell("Responsável Técnico:", boldTextFont, Color.WHITE, false));
            table.addCell(createCell(technicalManager, textFont, Color.WHITE, false));
        }

        document.add(table);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /** Data no formato brasileiro, usado em todo o documento. */
    static String formatDateBR(java.time.LocalDate date) {
        return date != null
                ? date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "N/A";
    }

    /** Status em português: o PDF é lido pelo cliente final. */
    static String translateStatus(com.axelcrm.entity.enums.ProposalStatus status) {
        if (status == null) {
            return "N/A";
        }
        return switch (status) {
            case DRAFT -> "Rascunho";
            case SENT -> "Enviada";
            case VIEWED -> "Visualizada";
            case NEGOTIATING -> "Em negociação";
            case ACCEPTED -> "Aceita";
            case REJECTED -> "Rejeitada";
            case EXPIRED -> "Expirada";
        };
    }

    private PdfPCell createCell(String text, Font font, Color bgColor, boolean border) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        if (!border) {
            cell.setBorder(PdfPCell.NO_BORDER);
        } else {
            cell.setBorderColor(new Color(226, 232, 240));
        }
        return cell;
    }

    private String formatCurrencyBRL(BigDecimal amount) {
        if (amount == null) return "R$ 0,00";
        java.text.NumberFormat nf = java.text.NumberFormat.getCurrencyInstance(java.util.Locale.of("pt", "BR"));
        return nf.format(amount);
    }

    private UserResponse mapUserToResponse(User u) {
        if (u == null) return null;
        return new UserResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole(),
                u.isActive(),
                u.getOrganization() != null ? u.getOrganization().getId() : null,
                u.getOrganization() != null ? u.getOrganization().getName() : null,
                null,
                u.getCreatedAt()
        );
    }

    private PartnerResponse mapPartnerToResponse(Partner p) {
        if (p == null) return null;
        return new PartnerResponse(
                p.getId(),
                p.getName(),
                p.getEmail(),
                p.getPhone(),
                p.getCompany(),
                p.getBankDetails(),
                p.getCommissionPercentage(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                0L, 0L, java.math.BigDecimal.ZERO
        );
    }

    /**
     * Aplica os campos juridicos e periciais da proposta: advogado vinculado, origem da
     * indicacao, perito responsavel, responsavel tecnico e projeto vinculado.
     * Campo ausente no request limpa o valor atual, seguindo o comportamento dos demais
     * relacionamentos da proposta.
     */
    private void applyLegalAndExpertFields(UUID organizationId, Proposal proposal, ProposalRequest request) {
        if (request.lawyerContactId() != null) {
            Contact lawyer = contactRepository.findByIdAndOrganization_Id(request.lawyerContactId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", request.lawyerContactId()));
            proposal.setLawyerContact(lawyer);
        } else {
            proposal.setLawyerContact(null);
        }

        // O nome livre so vale quando nao ha contato vinculado; com contato, o nome vem dele.
        proposal.setLawyerName(request.lawyerContactId() == null ? request.lawyerName() : null);

        proposal.setReferralSource(request.referralSource());

        if (request.expertUserId() != null) {
            proposal.setExpertUser(userRepository.findById(request.expertUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.expertUserId())));
        } else {
            proposal.setExpertUser(null);
        }

        if (request.technicalManagerUserId() != null) {
            proposal.setTechnicalManagerUser(userRepository.findById(request.technicalManagerUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.technicalManagerUserId())));
        } else {
            proposal.setTechnicalManagerUser(null);
        }

        if (request.projectId() != null) {
            Project linked = projectRepository.findByIdAndOrganization_Id(request.projectId(), organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.projectId()));
            proposal.setProject(linked);
        } else {
            proposal.setProject(null);
        }
    }

    private void triggerPostApprovalActions(UUID organizationId, Proposal proposal) {
        // 1. Transition Deal if linked
        if (proposal.getDeal() != null) {
            Deal deal = proposal.getDeal();
            List<PipelineStage> stages = pipelineStageRepository
                    .findByPipeline_IdAndOrganization_IdAndDeletedAtIsNull(deal.getPipeline().getId(), organizationId)
                    .stream()
                    .sorted(Comparator.comparingInt(PipelineStage::getPosition))
                    .toList();
            if (!stages.isEmpty()) {
                PipelineStage finalStage = stages.get(stages.size() - 1);
                UUID userId = proposal.getAssignedTo() != null ? proposal.getAssignedTo().getId() : null;
                pipelineEngine.transitionStage(organizationId, userId, deal, finalStage, "Aprovação automática via Proposta comercial");
            }
        }

        // 2. Auto-generate Project
        // Proposta com projeto vinculado manualmente nao gera um segundo projeto.
        if (proposal.getProject() != null) {
            return;
        }

        boolean projectExists = projectRepository.existsBySourceProposalIdAndOrganization_IdAndDeletedAtIsNull(proposal.getId(), organizationId);
        if (!projectExists) {
            Project project = new Project();
            project.setName("Projeto: " + proposal.getTitle());
            project.setDescription(proposal.getDescription());
            project.setStartDate(java.time.LocalDate.now());
            project.setEndDate(java.time.LocalDate.now().plusMonths(3));
            project.setBudget(proposal.getTotalAmount());
            project.setCost(BigDecimal.ZERO);
            project.setStatus("PLANEJAMENTO");
            project.setClient(proposal.getClient());
            project.setManager(proposal.getAssignedTo());
            project.setSourceProposalId(proposal.getId());
            var org = new com.axelcrm.commons.entity.Organization();
            org.setId(organizationId);
            project.setOrganization(org);
            project = projectRepository.save(project);

            // O projeto gerado passa a ser o projeto vinculado da proposta.
            proposal.setProject(project);
            proposalRepository.save(proposal);
        }
    }
}
