package com.axelcrm.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.axelcrm.dto.ProposalRequest;
import com.axelcrm.dto.ProposalResponse;
import com.axelcrm.auth.entity.User;
import com.axelcrm.auth.repository.UserRepository;
import com.axelcrm.commons.entity.Organization;
import com.axelcrm.commons.exception.BadRequestException;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.entity.Client;
import com.axelcrm.entity.Contact;
import com.axelcrm.entity.Project;
import com.axelcrm.entity.Proposal;
import com.axelcrm.entity.enums.LeadSource;
import com.axelcrm.entity.enums.ProposalStatus;
import com.axelcrm.repository.ClientRepository;
import com.axelcrm.repository.ContactRepository;
import com.axelcrm.repository.ProjectRepository;
import com.axelcrm.repository.ProposalItemRepository;
import com.axelcrm.repository.ProposalRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class ProposalServiceTest {

    @Mock
    ProposalRepository proposalRepository;

    @Mock
    ProposalItemRepository proposalItemRepository;

    @Mock
    ClientRepository clientRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    ContactRepository contactRepository;

    @Mock
    ProjectRepository projectRepository;

    @InjectMocks
    ProposalService proposalService;

    private final UUID orgId = UUID.randomUUID();
    private final UUID proposalId = UUID.randomUUID();
    private final UUID clientId = UUID.randomUUID();

    private Proposal createProposal() {
        var org = new Organization();
        org.setId(orgId);

        var client = new Client();
        client.setId(clientId);
        client.setName("ClientCo");

        var proposal = new Proposal();
        proposal.setId(proposalId);
        proposal.setTitle("Website Proposal");
        proposal.setDescription("Complete website design and development");
        proposal.setStatus(ProposalStatus.DRAFT);
        proposal.setTotalAmount(new BigDecimal("15000"));
        proposal.setDiscountAmount(BigDecimal.ZERO);
        proposal.setIssueDate(LocalDate.of(2026, 7, 1));
        proposal.setValidUntil(LocalDate.of(2026, 8, 1));
        proposal.setClient(client);
        proposal.setOrganization(org);
        return proposal;
    }

    @Test
    void findAll_ShouldReturnPagedProposals() {
        var proposal = createProposal();
        var pageable = PageRequest.of(0, 10);
        var page = new PageImpl<>(List.of(proposal));

        when(proposalRepository.findByOrganization_IdAndDeletedAtIsNull(orgId, pageable)).thenReturn(page);

        Page<ProposalResponse> result = proposalService.findAll(orgId, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Website Proposal", result.getContent().getFirst().title());
    }

    @Test
    void findById_ShouldReturnProposal() {
        var proposal = createProposal();
        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId))
                .thenReturn(Optional.of(proposal));

        ProposalResponse result = proposalService.findById(orgId, proposalId);

        assertNotNull(result);
        assertEquals(proposalId, result.id());
        assertEquals("Complete website design and development", result.description());
    }

    @Test
    void findById_ShouldThrowWhenNotFound() {
        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> proposalService.findById(orgId, proposalId));
    }

    @Test
    void create_ShouldSaveAndReturnProposal() {
        var request = new ProposalRequest(
                "New Proposal", "Description", ProposalStatus.DRAFT,
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 1),
                BigDecimal.ZERO, clientId, null, null, null);

        var client = new Client();
        client.setId(clientId);

        var saved = new Proposal();
        saved.setId(proposalId);
        saved.setTitle("New Proposal");
        saved.setDescription("Description");
        saved.setTotalAmount(BigDecimal.ZERO);
        saved.setClient(client);

        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId))
                .thenReturn(Optional.of(client));
        when(proposalRepository.save(any(Proposal.class))).thenReturn(saved);

        ProposalResponse result = proposalService.create(orgId, request);

        assertNotNull(result);
        assertEquals("New Proposal", result.title());
    }

    @Test
    void create_ShouldThrowWhenClientNotFound() {
        ProposalRequest request = new ProposalRequest("New Proposal", null, null, null, null, null, clientId, null, null, null);

        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> proposalService.create(orgId, request));
    }

    @Test
    void update_ShouldModifyAndReturnProposal() {
        ProposalRequest request = new ProposalRequest("Updated Proposal", "Updated desc", ProposalStatus.SENT, LocalDate.now(), LocalDate.now().plusDays(10), BigDecimal.valueOf(100), clientId, null, null, null);
        var existing = createProposal();

        var client = new Client();
        client.setId(clientId);

        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId))
                .thenReturn(Optional.of(existing));
        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId))
                .thenReturn(Optional.of(client));
        when(proposalRepository.save(any(Proposal.class))).thenAnswer(i -> i.getArgument(0));

        ProposalResponse result = proposalService.update(orgId, proposalId, request);

        assertNotNull(result);
        assertEquals("Updated Proposal", result.title());
    }

    /** Request com os campos juridicos e periciais preenchidos. */
    private ProposalRequest legalRequest(UUID lawyerContactId, String lawyerName, UUID expertId,
                                         UUID technicalManagerId, UUID projectId) {
        return new ProposalRequest(
                "Laudo pericial", "Perícia de engenharia", ProposalStatus.DRAFT,
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 1),
                null, BigDecimal.ZERO, clientId, null, null, null,
                null, null, null, null, null, null, null, null,
                lawyerContactId, lawyerName, LeadSource.REFERRAL, expertId, technicalManagerId, projectId);
    }

    @Test
    void create_ShouldLinkLawyerContactExpertTechnicalManagerAndProject() {
        var lawyerContactId = UUID.randomUUID();
        var expertId = UUID.randomUUID();
        var technicalManagerId = UUID.randomUUID();
        var projectId = UUID.randomUUID();

        var client = new Client();
        client.setId(clientId);

        var lawyer = new Contact();
        lawyer.setId(lawyerContactId);
        lawyer.setName("Dra. Helena Prado");

        var expert = new User();
        expert.setId(expertId);
        expert.setName("Perito Silva");

        var technicalManager = new User();
        technicalManager.setId(technicalManagerId);
        technicalManager.setName("Responsável Souza");

        var project = new Project();
        project.setId(projectId);
        project.setName("Projeto Alfa");

        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId)).thenReturn(Optional.of(client));
        when(contactRepository.findByIdAndOrganization_Id(lawyerContactId, orgId)).thenReturn(Optional.of(lawyer));
        when(userRepository.findById(expertId)).thenReturn(Optional.of(expert));
        when(userRepository.findById(technicalManagerId)).thenReturn(Optional.of(technicalManager));
        when(projectRepository.findByIdAndOrganization_Id(projectId, orgId)).thenReturn(Optional.of(project));
        when(proposalRepository.save(any(Proposal.class))).thenAnswer(i -> i.getArgument(0));

        ProposalResponse result = proposalService.create(orgId, legalRequest(lawyerContactId, null, expertId, technicalManagerId, projectId));

        assertEquals(lawyerContactId, result.lawyerContactId());
        assertEquals("Dra. Helena Prado", result.lawyerName());
        assertEquals(LeadSource.REFERRAL, result.referralSource());
        assertEquals(expertId, result.expertUser().id());
        assertEquals(technicalManagerId, result.technicalManagerUser().id());
        assertEquals(projectId, result.projectId());
        assertEquals("Projeto Alfa", result.projectName());
    }

    @Test
    void create_ShouldKeepFreeTextLawyerNameWhenNoContactIsLinked() {
        var client = new Client();
        client.setId(clientId);

        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId)).thenReturn(Optional.of(client));
        when(proposalRepository.save(any(Proposal.class))).thenAnswer(i -> i.getArgument(0));

        ProposalResponse result = proposalService.create(orgId, legalRequest(null, "Dr. Advogado Externo", null, null, null));

        assertNull(result.lawyerContactId());
        assertEquals("Dr. Advogado Externo", result.lawyerName());
    }

    @Test
    void create_ShouldThrowWhenLawyerContactDoesNotExist() {
        var lawyerContactId = UUID.randomUUID();

        var client = new Client();
        client.setId(clientId);

        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId)).thenReturn(Optional.of(client));
        when(contactRepository.findByIdAndOrganization_Id(lawyerContactId, orgId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> proposalService.create(orgId, legalRequest(lawyerContactId, null, null, null, null)));
    }

    @Test
    void update_ShouldClearLegalFieldsWhenRequestOmitsThem() {
        var existing = createProposal();

        var lawyer = new Contact();
        lawyer.setId(UUID.randomUUID());
        lawyer.setName("Dra. Helena Prado");
        existing.setLawyerContact(lawyer);

        var expert = new User();
        expert.setId(UUID.randomUUID());
        existing.setExpertUser(expert);

        var project = new Project();
        project.setId(UUID.randomUUID());
        existing.setProject(project);

        var client = new Client();
        client.setId(clientId);

        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId)).thenReturn(Optional.of(existing));
        when(clientRepository.findByIdAndOrganization_Id(clientId, orgId)).thenReturn(Optional.of(client));
        when(proposalRepository.save(any(Proposal.class))).thenAnswer(i -> i.getArgument(0));

        ProposalRequest request = new ProposalRequest(
                "Sem vínculos", null, ProposalStatus.DRAFT, null, null,
                BigDecimal.ZERO, clientId, null, null, null);

        ProposalResponse result = proposalService.update(orgId, proposalId, request);

        assertNull(result.lawyerContactId());
        assertNull(result.lawyerName());
        assertNull(result.referralSource());
        assertNull(result.expertUser());
        assertNull(result.technicalManagerUser());
        assertNull(result.projectId());
    }

    @Test
    void convertToProject_ShouldThrowWhenProposalAlreadyHasLinkedProject() {
        var proposal = createProposal();
        proposal.setStatus(ProposalStatus.ACCEPTED);

        var project = new Project();
        project.setId(UUID.randomUUID());
        proposal.setProject(project);

        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId)).thenReturn(Optional.of(proposal));

        assertThrows(BadRequestException.class, () -> proposalService.convertToProject(orgId, proposalId));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void generateProposalPdf_ShouldRenderWithAndWithoutCaseData() {
        var proposal = createProposal();

        var lawyer = new Contact();
        lawyer.setName("Dra. Helena Prado");
        proposal.setLawyerContact(lawyer);

        var expert = new User();
        expert.setName("Eng. Marcos Ribeiro");
        proposal.setExpertUser(expert);

        var technicalManager = new User();
        technicalManager.setName("Eng. Paula Nogueira");
        proposal.setTechnicalManagerUser(technicalManager);

        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId)).thenReturn(Optional.of(proposal));

        byte[] withCaseData = proposalService.generateProposalPdf(orgId, proposalId);
        assertTrue(withCaseData.length > 0);
        assertEquals("%PDF", new String(withCaseData, 0, 4));

        // Sem dados do caso a seção é omitida, então o documento fica menor.
        proposal.setLawyerContact(null);
        proposal.setExpertUser(null);
        proposal.setTechnicalManagerUser(null);

        byte[] withoutCaseData = proposalService.generateProposalPdf(orgId, proposalId);
        assertEquals("%PDF", new String(withoutCaseData, 0, 4));
        assertTrue(withoutCaseData.length < withCaseData.length,
                "PDF sem dados do caso deveria ser menor que o PDF com a seção");
    }

    @Test
    void translateStatus_ShouldRenderPortugueseLabelsForEveryStatus() {
        assertEquals("Rascunho", ProposalService.translateStatus(ProposalStatus.DRAFT));
        assertEquals("Enviada", ProposalService.translateStatus(ProposalStatus.SENT));
        assertEquals("Visualizada", ProposalService.translateStatus(ProposalStatus.VIEWED));
        assertEquals("Em negociação", ProposalService.translateStatus(ProposalStatus.NEGOTIATING));
        assertEquals("Aceita", ProposalService.translateStatus(ProposalStatus.ACCEPTED));
        assertEquals("Rejeitada", ProposalService.translateStatus(ProposalStatus.REJECTED));
        assertEquals("Expirada", ProposalService.translateStatus(ProposalStatus.EXPIRED));
        assertEquals("N/A", ProposalService.translateStatus(null));
    }

    @Test
    void formatDateBR_ShouldUseBrazilianFormat() {
        assertEquals("07/08/2026", ProposalService.formatDateBR(LocalDate.of(2026, 8, 7)));
        assertEquals("N/A", ProposalService.formatDateBR(null));
    }

    @Test
    void delete_ShouldSetDeletedAt() {
        var proposal = createProposal();
        when(proposalRepository.findByIdAndOrganization_Id(proposalId, orgId))
                .thenReturn(Optional.of(proposal));

        proposalService.delete(orgId, proposalId);

        assertNotNull(proposal.getDeletedAt());
        verify(proposalRepository).save(proposal);
    }
}
