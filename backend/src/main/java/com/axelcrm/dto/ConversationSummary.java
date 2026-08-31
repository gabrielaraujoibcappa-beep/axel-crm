package com.axelcrm.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationSummary(String phone, String contactName, String lastMessage,
                                  LocalDateTime lastMessageAt, long unreadCount,
                                  String linkedType, UUID linkedId, String linkedLabel) { }
