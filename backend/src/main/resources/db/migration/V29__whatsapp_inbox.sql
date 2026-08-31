-- WhatsApp inbox message deduplication and session tracking.

ALTER TABLE messages
    ADD COLUMN wa_message_id VARCHAR,
    ADD COLUMN is_read BOOLEAN DEFAULT false,
    ADD COLUMN integration_id UUID,
    ADD CONSTRAINT fk_messages_integration
        FOREIGN KEY (integration_id) REFERENCES integrations (id);

CREATE UNIQUE INDEX idx_messages_wa_message_id ON messages (wa_message_id);

CREATE TABLE whatsapp_sessions
(
    id              UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    integration_id  UUID,
    status          VARCHAR NOT NULL CHECK (status IN ('CONNECTING', 'CONNECTED', 'DISCONNECTED')),
    qrcode          TEXT,
    instance_id     VARCHAR,
    last_seen_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP,
    deleted_at      TIMESTAMP,
    CONSTRAINT fk_whatsapp_sessions_organization
        FOREIGN KEY (organization_id) REFERENCES organizations (id),
    CONSTRAINT fk_whatsapp_sessions_integration
        FOREIGN KEY (integration_id) REFERENCES integrations (id)
);

CREATE INDEX idx_whatsapp_sessions_org ON whatsapp_sessions (organization_id);
