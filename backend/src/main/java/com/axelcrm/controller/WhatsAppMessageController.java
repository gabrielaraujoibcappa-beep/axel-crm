package com.axelcrm.controller;

import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.dto.*;
import com.axelcrm.service.WhatsAppInboxService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/whatsapp")
@RequiredArgsConstructor
public class WhatsAppMessageController {
    private final WhatsAppInboxService inbox;
    @GetMapping("/status") public ResponseEntity<WhatsAppStatusResponse> status(@RequestParam(required = false) UUID integrationId) { return ResponseEntity.ok(inbox.status(TenantContext.getOrganizationId(), integrationId)); }
    @PostMapping("/connect") public ResponseEntity<WhatsAppStatusResponse> connect(@RequestParam(required = false) UUID integrationId) { return ResponseEntity.ok(inbox.connect(TenantContext.getOrganizationId(), integrationId)); }
    @PostMapping("/disconnect") public ResponseEntity<Void> disconnect(@RequestParam(required = false) UUID integrationId) { inbox.disconnect(TenantContext.getOrganizationId(), integrationId); return ResponseEntity.noContent().build(); }
    @GetMapping("/conversations") public ResponseEntity<List<ConversationSummary>> conversations() { return ResponseEntity.ok(inbox.conversations(TenantContext.getOrganizationId())); }
    @PostMapping("/conversations/{phone}/read") public ResponseEntity<Void> readConversation(@PathVariable String phone) { inbox.markConversationRead(TenantContext.getOrganizationId(), phone); return ResponseEntity.noContent().build(); }
    @PostMapping("/conversations/{phone}/link") public ResponseEntity<ConversationSummary> link(@PathVariable String phone, @Valid @RequestBody WhatsAppConversationLinkRequest request) { return ResponseEntity.ok(inbox.linkConversation(TenantContext.getOrganizationId(), phone, request)); }
    @PostMapping("/conversations/{phone}/unlink") public ResponseEntity<ConversationSummary> unlink(@PathVariable String phone) { return ResponseEntity.ok(inbox.unlinkConversation(TenantContext.getOrganizationId(), phone)); }
    @DeleteMapping("/conversations/{phone}/link") public ResponseEntity<ConversationSummary> deleteLink(@PathVariable String phone) { return ResponseEntity.ok(inbox.unlinkConversation(TenantContext.getOrganizationId(), phone)); }
    @GetMapping("/conversations/{phone}/messages") public ResponseEntity<Page<WhatsAppMessageResponse>> messages(@PathVariable String phone, Pageable pageable) { return ResponseEntity.ok(inbox.conversation(TenantContext.getOrganizationId(), phone, pageable)); }
    @PostMapping("/conversations/{phone}/messages") public ResponseEntity<WhatsAppMessageResponse> send(@PathVariable String phone, @Valid @RequestBody WhatsAppMessageRequest request) { return ResponseEntity.ok(inbox.send(TenantContext.getOrganizationId(), phone, request)); }
    @PostMapping("/messages/{id}/read") public ResponseEntity<Void> read(@PathVariable UUID id) { inbox.markRead(TenantContext.getOrganizationId(), id); return ResponseEntity.noContent().build(); }
}
