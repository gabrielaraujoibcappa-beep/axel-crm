package com.axelcrm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record WhatsAppConversationLinkRequest(
    @JsonAlias("linkedType") @NotBlank String type,
    @JsonAlias("linkedId") @NotNull UUID id
) { }
