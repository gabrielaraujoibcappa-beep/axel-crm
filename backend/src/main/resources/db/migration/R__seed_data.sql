-- Seed data for Axel CRM
-- Run after the application has started and Flyway migrations have been applied.

-- Default organization
INSERT INTO organizations (id, name, domain, active, created_at, updated_at)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Axel Empreendimentos', 'axelcrm.com', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Default admin user (password: admin123, bcrypt encoded)
INSERT INTO users (id, organization_id, email, password, name, role, active, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@axelcrm.com',
    '$2a$10$Gn2EG22MGGT0w5qwanDvcegiV7gLuir56iQIA2zsmVk7acvyhEonS',
    'Administrador',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Dynamic Multi-Tenant Mock Seeding for all organizations
DO $$
DECLARE
    org_rec RECORD;
    c_gabriel_id UUID;
    c_client_id UUID;
    c_pipe_id UUID;
    c_stage1 UUID;
    c_stage2 UUID;
    c_stage3 UUID;
    c_stage4 UUID;
    c_stage5 UUID;
    c_deal1 UUID;
    c_deal2 UUID;
    c_deal3 UUID;
    c_deal4 UUID;
    c_proj1 UUID;
    c_proj2 UUID;
    c_task1 UUID;
    c_task2 UUID;
    c_task3 UUID;
    c_prop1 UUID;
    c_prop2 UUID;
    c_prop3 UUID;
    c_camp1 UUID;
    c_camp2 UUID;
    c_ticket1 UUID;
    c_ticket2 UUID;
    c_bank_id UUID;
    c_tx1 UUID;
    c_tx2 UUID;
    c_tx3 UUID;
    c_rule UUID;
    c_comm UUID;
    c_time1 UUID;
    c_time2 UUID;
BEGIN
    FOR org_rec IN SELECT id FROM organizations WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' LOOP
        -- Generate deterministic UUIDs based on organization ID to ensure stable repeatable runs
        c_gabriel_id := cast(md5(org_rec.id::text || 'gabriel') as uuid);
        c_client_id := cast(md5(org_rec.id::text || 'client') as uuid);
        c_pipe_id := cast(md5(org_rec.id::text || 'pipeline') as uuid);
        c_stage1 := cast(md5(org_rec.id::text || 'stage1') as uuid);
        c_stage2 := cast(md5(org_rec.id::text || 'stage2') as uuid);
        c_stage3 := cast(md5(org_rec.id::text || 'stage3') as uuid);
        c_stage4 := cast(md5(org_rec.id::text || 'stage4') as uuid);
        c_stage5 := cast(md5(org_rec.id::text || 'stage5') as uuid);
        c_deal1 := cast(md5(org_rec.id::text || 'deal1') as uuid);
        c_deal2 := cast(md5(org_rec.id::text || 'deal2') as uuid);
        c_deal3 := cast(md5(org_rec.id::text || 'deal3') as uuid);
        c_deal4 := cast(md5(org_rec.id::text || 'deal4') as uuid);
        c_proj1 := cast(md5(org_rec.id::text || 'proj1') as uuid);
        c_proj2 := cast(md5(org_rec.id::text || 'proj2') as uuid);
        c_task1 := cast(md5(org_rec.id::text || 'task1') as uuid);
        c_task2 := cast(md5(org_rec.id::text || 'task2') as uuid);
        c_task3 := cast(md5(org_rec.id::text || 'task3') as uuid);
        c_prop1 := cast(md5(org_rec.id::text || 'prop1') as uuid);
        c_prop2 := cast(md5(org_rec.id::text || 'prop2') as uuid);
        c_prop3 := cast(md5(org_rec.id::text || 'prop3') as uuid);
        c_camp1 := cast(md5(org_rec.id::text || 'camp1') as uuid);
        c_camp2 := cast(md5(org_rec.id::text || 'camp2') as uuid);
        c_ticket1 := cast(md5(org_rec.id::text || 'ticket1') as uuid);
        c_ticket2 := cast(md5(org_rec.id::text || 'ticket2') as uuid);
        c_bank_id := cast(md5(org_rec.id::text || 'bank') as uuid);
        c_tx1 := cast(md5(org_rec.id::text || 'tx1') as uuid);
        c_tx2 := cast(md5(org_rec.id::text || 'tx2') as uuid);
        c_tx3 := cast(md5(org_rec.id::text || 'tx3') as uuid);
        c_rule := cast(md5(org_rec.id::text || 'rule') as uuid);
        c_comm := cast(md5(org_rec.id::text || 'comm') as uuid);
        c_time1 := cast(md5(org_rec.id::text || 'time1') as uuid);
        c_time2 := cast(md5(org_rec.id::text || 'time2') as uuid);

        -- Delete ALL rows dependent on seed data to ensure clean repeatable run
        -- Ordered by dependency to avoid foreign key errors without superuser role

        -- Clean all seed-related data
        DELETE FROM time_entries WHERE project_id IN (c_proj1, c_proj2);
        DELETE FROM time_entries WHERE id IN (c_time1, c_time2);
        DELETE FROM time_entries WHERE project_id IN (SELECT id FROM projects WHERE client_id = c_client_id);
        DELETE FROM tasks WHERE client_id = c_client_id;
        DELETE FROM projects WHERE client_id = c_client_id;
        DELETE FROM proposal_items WHERE proposal_id IN (SELECT id FROM proposals WHERE client_id = c_client_id);
        DELETE FROM proposals WHERE client_id = c_client_id;
        DELETE FROM commissions WHERE id = c_comm;
        DELETE FROM financial_transactions WHERE id IN (c_tx1, c_tx2, c_tx3);
        DELETE FROM deals WHERE client_id = c_client_id;
        DELETE FROM client_notes WHERE client_id = c_client_id;
        DELETE FROM client_attachments WHERE client_id = c_client_id;
        DELETE FROM contacts WHERE client_id = c_client_id;
        DELETE FROM support_tickets WHERE client_id = c_client_id;
        DELETE FROM support_tickets WHERE id IN (c_ticket1, c_ticket2);
        DELETE FROM documents WHERE client_id = c_client_id OR project_id IN (c_proj1, c_proj2);
        DELETE FROM invoices WHERE client_id = c_client_id;
        DELETE FROM contracts WHERE client_id = c_client_id;
        UPDATE leads SET converted_client_id = NULL WHERE converted_client_id = c_client_id;
        DELETE FROM clients WHERE id = c_client_id;
        DELETE FROM commission_rules WHERE id = c_rule;
        DELETE FROM bank_accounts WHERE id = c_bank_id;
        DELETE FROM campaigns WHERE id IN (c_camp1, c_camp2);
        DELETE FROM pipeline_stages WHERE pipeline_id = c_pipe_id;
        DELETE FROM pipelines WHERE id = c_pipe_id;
        DELETE FROM pipeline_stages WHERE id IN (c_stage1, c_stage2, c_stage3, c_stage4, c_stage5);
        DELETE FROM audit_logs WHERE user_id = c_gabriel_id;
        DELETE FROM users WHERE id = c_gabriel_id;

        -- Clean up other manual conflicts with the same email to ensure our ID is unique and works
        DELETE FROM time_entries WHERE project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com'));
        DELETE FROM tasks WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM projects WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM proposal_items WHERE proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com'));
        DELETE FROM proposals WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM deals WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM client_notes WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM client_attachments WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM contacts WHERE client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        UPDATE leads SET converted_client_id = NULL WHERE converted_client_id IN (SELECT id FROM clients WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM clients WHERE email = 'Gabrielalves6p@gmail.com';
        DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE email = 'Gabrielalves6p@gmail.com');
        DELETE FROM users WHERE email = 'Gabrielalves6p@gmail.com';

        -- 1. Create Gabriel User (SUPER_ADMIN)
        INSERT INTO users (id, organization_id, email, password, name, role, active, created_at, updated_at)
        VALUES (
            c_gabriel_id,
            org_rec.id,
            'Gabrielalves6p@gmail.com',
            '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrttPmYylG5RB/KVJhT8N3Kj3cXuQG',
            'GABRIEL ATY',
            'SUPER_ADMIN',
            true,
            NOW(),
            NOW()
        );

        -- 2. Create default Pipeline and Stages
        INSERT INTO pipelines (id, organization_id, name, created_at, updated_at)
        VALUES (c_pipe_id, org_rec.id, 'Vendas Padrão', NOW(), NOW());

        INSERT INTO pipeline_stages (id, organization_id, pipeline_id, name, order_index, created_at, updated_at)
        VALUES
            (c_stage1, org_rec.id, c_pipe_id, 'Novo', 1, NOW(), NOW()),
            (c_stage2, org_rec.id, c_pipe_id, 'Contatado', 2, NOW(), NOW()),
            (c_stage3, org_rec.id, c_pipe_id, 'Qualificado', 3, NOW(), NOW()),
            (c_stage4, org_rec.id, c_pipe_id, 'Proposta', 4, NOW(), NOW()),
            (c_stage5, org_rec.id, c_pipe_id, 'Fechado', 5, NOW(), NOW());

        -- 3. Create Gabriel Client
        INSERT INTO clients (id, organization_id, name, document, email, phone, company_name, website, address, city, state, zip_code, country, industry, notes, active, assigned_to, created_at, updated_at)
        VALUES (
            c_client_id,
            org_rec.id,
            'GABRIEL ATY',
            '7489222135',
            'Gabrielalves6p@gmail.com',
            '62983126539',
            'efdsts',
            'https://www.speedtest.net/pt/result/19381270677',
            'Rua 268',
            'Goiânia',
            'GO',
            '74533-230',
            'Brasil',
            'sadas',
            'Notas e Observações internas da conta GABRIEL ATY.',
            true,
            c_gabriel_id,
            NOW(),
            NOW()
        );

        -- 4. Create Client Notes (Histórico & Interações)
        INSERT INTO client_notes (id, organization_id, client_id, user_id, content, created_at)
        VALUES
            (cast(md5(org_rec.id::text || 'note1') as uuid), org_rec.id, c_client_id, c_gabriel_id, 'Reunião de kickoff realizada com sucesso. Alinhamos as principais dores do cliente referente ao controle de pipelines e transações financeiras.', NOW() - INTERVAL '3 days'),
            (cast(md5(org_rec.id::text || 'note2') as uuid), org_rec.id, c_client_id, c_gabriel_id, 'Cliente solicitou um orçamento de licenciamento anual para 25 usuários. Proposta será encaminhada até o final da tarde.', NOW() - INTERVAL '2 days'),
            (cast(md5(org_rec.id::text || 'note3') as uuid), org_rec.id, c_client_id, c_gabriel_id, 'Apresentação da demo do novo Kanban Board interativo realizada. Feedback do cliente foi excelente, elogiou muito a fluidez do drag-and-drop e a transição tema claro.', NOW() - INTERVAL '1 day');

        -- 5. Create Client Attachments (Arquivos & Anexos)
        INSERT INTO client_attachments (id, organization_id, client_id, user_id, file_name, file_type, file_size, created_at)
        VALUES
            (cast(md5(org_rec.id::text || 'att1') as uuid), org_rec.id, c_client_id, c_gabriel_id, 'proposta_comercial_axel_crm.pdf', 'application/pdf', 1024000, NOW() - INTERVAL '2 days'),
            (cast(md5(org_rec.id::text || 'att2') as uuid), org_rec.id, c_client_id, c_gabriel_id, 'requisitos_sistema_gabriel_aty.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 512000, NOW() - INTERVAL '1 day');

        -- 6. Create Deals (Negócios)
        INSERT INTO deals (id, organization_id, pipeline_id, stage_id, client_id, assigned_to, title, description, value, expected_close_date, won, created_at)
        VALUES
            (c_deal1, org_rec.id, c_pipe_id, c_stage3, c_client_id, c_gabriel_id, 'Implementação de CRM Customizado', 'Serviço completo de parametrização e deploy do Axel CRM', 45000.00, CURRENT_DATE + 30, NULL, NOW()),
            (c_deal2, org_rec.id, c_pipe_id, c_stage4, c_client_id, c_gabriel_id, 'Licenciamento Anual SaaS Axel', 'Assinatura anual recorrente para uso da plataforma', 12000.00, CURRENT_DATE + 15, NULL, NOW()),
            (c_deal3, org_rec.id, c_pipe_id, c_stage2, c_client_id, c_gabriel_id, 'Consultoria LGPD Martins', 'Mapeamento regulatório de dados', 8500.00, CURRENT_DATE + 45, NULL, NOW()),
            (c_deal4, org_rec.id, c_pipe_id, c_stage5, c_client_id, c_gabriel_id, 'Dashboard Analytics', 'Criação de métricas gerenciais', 20000.00, CURRENT_DATE - 2, true, NOW() - INTERVAL '5 days');

        -- 7. Create Projects
        INSERT INTO projects (id, organization_id, client_id, name, title, description, status, start_date, end_date, budget, created_at)
        VALUES
            (c_proj1, org_rec.id, c_client_id, 'Migração de BD', 'Migração de Banco de Dados de Produção', 'Migrar banco de dados legado para o novo schema PostgreSQL', 'IN_PROGRESS', CURRENT_DATE - 5, CURRENT_DATE + 15, 15000.00, NOW()),
            (c_proj2, org_rec.id, c_client_id, 'E-commerce', 'Desenvolvimento E-commerce', 'Construção da loja virtual com integração com gateways de pagamento', 'PLANNED', CURRENT_DATE + 10, CURRENT_DATE + 60, 35000.00, NOW());

        -- 8. Create Tasks (Tarefas)
        INSERT INTO tasks (id, organization_id, project_id, client_id, title, description, status, priority, assigned_to, due_date, created_at)
        VALUES
            (c_task1, org_rec.id, NULL, c_client_id, 'Ligar para alinhar requisitos da proposta', 'Alinhar com Gabriel se há necessidade de relatórios extras', 'PENDING', 'HIGH', c_gabriel_id, CURRENT_DATE + 2, NOW()),
            (c_task2, org_rec.id, NULL, c_client_id, 'Enviar contrato de prestação de serviços', 'Minuta padrão de contrato ajustada com escopo do projeto', 'PENDING', 'MEDIUM', c_gabriel_id, CURRENT_DATE + 5, NOW()),
            (c_task3, org_rec.id, c_proj2, c_client_id, 'Definição de Arquitetura de Software', 'Desenhar diagrama de arquitetura e modelos de dados para o E-commerce', 'PENDING', 'HIGH', c_gabriel_id, CURRENT_DATE + 12, NOW());

        -- 9. Create Proposals (Propostas)
        INSERT INTO proposals (id, organization_id, client_id, lead_id, title, description, status, total_value, valid_until, created_at)
        VALUES
            (c_prop1, org_rec.id, c_client_id, NULL, 'Proposta Comercial CRM Enterprise', 'Licenças corporativas + consultoria de implantação', 'SENT', 45000.00, CURRENT_DATE + 30, NOW()),
            (c_prop2, org_rec.id, c_client_id, NULL, 'Proposta Licenças de Usuários Adicionais', 'Pacote com 5 licenças adicionais de usuários ativos', 'ACCEPTED', 3600.00, CURRENT_DATE + 15, NOW()),
            (c_prop3, org_rec.id, c_client_id, NULL, 'Proposta Desenvolvimento Portal', 'Construção de portal corporativo com área de membros', 'DRAFT', 25000.00, CURRENT_DATE + 20, NOW());

        -- 10. Create Campaigns (Campanhas)
        INSERT INTO campaigns (id, organization_id, name, type, content, scheduled_at, sent_at, recipients_count, sent_count, open_count, click_count, status, created_by, created_at)
        VALUES
            (c_camp1, org_rec.id, 'Newsletter Julho 2026', 'EMAIL', 'Conteúdo completo da newsletter de novidades de Julho.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 120, 120, 85, 42, 'ENVIADA', c_gabriel_id, NOW() - INTERVAL '5 days'),
            (c_camp2, org_rec.id, 'Promoção Dia dos Pais', 'EMAIL', 'Promoção especial com cupons exclusivos para dia dos pais.', NOW() + INTERVAL '10 days', NULL, 0, 0, 0, 0, 'RASCUNHO', c_gabriel_id, NOW());

        -- 11. Create Support Tickets (Tickets)
        INSERT INTO support_tickets (id, organization_id, client_id, subject, description, status, priority, assigned_to, created_by, created_at)
        VALUES
            (c_ticket1, org_rec.id, c_client_id, 'Erro ao gerar nota fiscal', 'Ocorre erro 500 ao tentar faturar a proposta de serviço #1024 no sistema.', 'OPEN', 'HIGH', c_gabriel_id, c_gabriel_id, NOW() - INTERVAL '1 day'),
            (c_ticket2, org_rec.id, c_client_id, 'Dúvida sobre integração Stripe', 'Como configurar a chave de assinatura de webhooks no Stripe dashboard?', 'RESOLVED', 'LOW', c_gabriel_id, c_gabriel_id, NOW() - INTERVAL '3 days');

        -- 12. Create Bank Accounts (Contas Bancárias)
        INSERT INTO bank_accounts (id, organization_id, name, bank, account_number, agency, balance, active, created_at)
        VALUES
            (c_bank_id, org_rec.id, 'Itaú Corporate', 'Banco Itaú S.A.', '48392-1', '3829', 125430.22, true, NOW());

        -- 13. Create Financial Transactions (Transações)
        INSERT INTO financial_transactions (id, organization_id, client_id, type, description, amount, category, transaction_date, due_date, paid_at, paid, payment_method, bank_account_id, deal_id, created_at)
        VALUES
            (c_tx1, org_rec.id, c_client_id, 'INCOME', 'Pagamento parcela 01 - Proposta CRM Enterprise', 22500.00, 'Vendas', CURRENT_DATE - 5, CURRENT_DATE - 5, NOW() - INTERVAL '5 days', true, 'BOLETO', c_bank_id, c_deal1, NOW()),
            (c_tx2, org_rec.id, c_client_id, 'INCOME', 'Assinatura SaaS Axel - Gabriel Alves', 1000.00, 'Assinatura', CURRENT_DATE, CURRENT_DATE, NOW(), true, 'CREDIT_CARD', c_bank_id, c_deal2, NOW()),
            (c_tx3, org_rec.id, NULL, 'EXPENSE', 'Hospedagem Servidores AWS Cloud', 3500.00, 'Infraestrutura', CURRENT_DATE, CURRENT_DATE, NOW(), true, 'CREDIT_CARD', c_bank_id, NULL, NOW());

        -- 14. Create Commission Rules
        INSERT INTO commission_rules (id, organization_id, name, description, percentage, min_value, max_value, active, created_at)
        VALUES
            (c_rule, org_rec.id, 'Comissão Vendas Enterprise', 'Regra de 5% de comissão para grandes negócios fechados', 0.0500, 10000.00, 100000.00, true, NOW());

        -- 15. Create Commissions
        INSERT INTO commissions (id, organization_id, deal_id, user_id, rule_id, deal_value, amount, paid, paid_at, created_at)
        VALUES
            (c_comm, org_rec.id, c_deal1, c_gabriel_id, c_rule, 45000.00, 2250.00, false, NULL, NOW());

        -- 16. Time Entries (Horas)
        INSERT INTO time_entries (id, organization_id, user_id, task_id, project_id, start_time, end_time, duration_minutes, description, created_at)
        VALUES
            (c_time1, org_rec.id, c_gabriel_id, NULL, c_proj1, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', 120, 'Mapeamento das tabelas do banco de dados legado', NOW()),
            (c_time2, org_rec.id, c_gabriel_id, NULL, c_proj1, NOW() - INTERVAL '2 hours', NOW(), 120, 'Escrita do script SQL de conversão e teste local', NOW());

    END LOOP;
END $$;
