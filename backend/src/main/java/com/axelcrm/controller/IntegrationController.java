package com.axelcrm.controller;

import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.dto.IntegrationRequest;
import com.axelcrm.dto.IntegrationResponse;
import com.axelcrm.service.GoogleIntegrationService;
import com.axelcrm.service.IntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Tag(name = "Integrations", description = "External integrations")
public class IntegrationController {
    private final IntegrationService integrationService;
    private final GoogleIntegrationService googleIntegrationService;

    @GetMapping
    public ResponseEntity<Page<IntegrationResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(integrationService.findAll(TenantContext.getOrganizationId(), pageable));
    }
    @GetMapping("/{id}")
    public ResponseEntity<IntegrationResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(integrationService.findById(TenantContext.getOrganizationId(), id));
    }
    @PostMapping
    public ResponseEntity<IntegrationResponse> create(@Valid @RequestBody IntegrationRequest request) {
        return ResponseEntity.ok(integrationService.create(TenantContext.getOrganizationId(), request));
    }
    @PutMapping("/{id}")
    public ResponseEntity<IntegrationResponse> update(@PathVariable UUID id, @Valid @RequestBody IntegrationRequest request) {
        return ResponseEntity.ok(integrationService.update(TenantContext.getOrganizationId(), id, request));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        integrationService.delete(TenantContext.getOrganizationId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/google/status")
    @Operation(summary = "Get Google OAuth2 connection status")
    public ResponseEntity<Map<String, Object>> getGoogleStatus() {
        return ResponseEntity.ok(googleIntegrationService.status(TenantContext.getOrganizationId(), TenantContext.getUserId()));
    }

    @PostMapping("/google/connect")
    @Operation(summary = "Start Google OAuth2 authorization")
    public ResponseEntity<Map<String, Object>> connectGoogle() {
        return ResponseEntity.ok(Map.of("authorizationUrl", googleIntegrationService.authorizationUrl(TenantContext.getOrganizationId(), TenantContext.getUserId())));
    }

    @GetMapping("/google/callback")
    public ResponseEntity<Void> googleCallback(@RequestParam String code, @RequestParam String state) {
        googleIntegrationService.completeAuthorization(code, state);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("http://localhost:4200/configuracoes?google=connected"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @PostMapping("/google/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectGoogle() {
        googleIntegrationService.disconnect(TenantContext.getOrganizationId(), TenantContext.getUserId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/google/calendar")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> getCalendarEvents() {
        return ResponseEntity.ok(googleIntegrationService.calendar(TenantContext.getOrganizationId(), TenantContext.getUserId()));
    }

    @GetMapping("/google/contacts")
    public ResponseEntity<com.fasterxml.jackson.databind.JsonNode> getGoogleContacts() {
        return ResponseEntity.ok(googleIntegrationService.contacts(TenantContext.getOrganizationId(), TenantContext.getUserId()));
    }

    @PostMapping("/google/gmail/send")
    public ResponseEntity<Void> sendGmail(@RequestBody Map<String, String> request) {
        googleIntegrationService.sendGmail(TenantContext.getOrganizationId(), TenantContext.getUserId(), request.get("to"), request.get("subject"), request.getOrDefault("body", ""));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai/generate")
    public ResponseEntity<Map<String, String>> generateAiText(@RequestBody Map<String, String> request) {
        String prompt = request.getOrDefault("prompt", "");
        String context = request.getOrDefault("context", "");
        return ResponseEntity.ok(Map.of("text", "Rascunho gerado para: " + prompt + "\n\nContexto: " + context));
    }
}
