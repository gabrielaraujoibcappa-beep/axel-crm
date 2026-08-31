CREATE TABLE google_tokens (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(320),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    scopes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_google_tokens_org FOREIGN KEY (organization_id) REFERENCES organizations (id),
    CONSTRAINT fk_google_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_google_tokens_org ON google_tokens (organization_id);
