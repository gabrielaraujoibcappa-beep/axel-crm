-- V28__proposal_legal_and_expert_fields.sql
-- Campos periciais e juridicos na proposta:
--   advogado vinculado (contato cadastrado + nome livre de fallback),
--   origem da indicacao (quem indicou continua sendo o parceiro/indicador),
--   perito responsavel e responsavel tecnico (usuarios, sem rateio de comissao),
--   vinculo com um projeto existente.

ALTER TABLE proposals
    ADD COLUMN lawyer_contact_id         UUID,
    ADD COLUMN lawyer_name               VARCHAR(200),
    ADD COLUMN referral_source           VARCHAR(50),
    ADD COLUMN expert_user_id            UUID,
    ADD COLUMN technical_manager_user_id UUID,
    ADD COLUMN project_id                UUID;

ALTER TABLE proposals
    ADD CONSTRAINT fk_proposals_lawyer_contact
        FOREIGN KEY (lawyer_contact_id) REFERENCES contacts (id),
    ADD CONSTRAINT fk_proposals_expert_user
        FOREIGN KEY (expert_user_id) REFERENCES users (id),
    ADD CONSTRAINT fk_proposals_technical_manager_user
        FOREIGN KEY (technical_manager_user_id) REFERENCES users (id),
    ADD CONSTRAINT fk_proposals_project
        FOREIGN KEY (project_id) REFERENCES projects (id);

CREATE INDEX idx_proposals_lawyer_contact ON proposals (lawyer_contact_id);
CREATE INDEX idx_proposals_expert_user ON proposals (expert_user_id);
CREATE INDEX idx_proposals_technical_manager_user ON proposals (technical_manager_user_id);
CREATE INDEX idx_proposals_project ON proposals (project_id);
