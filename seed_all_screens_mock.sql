-- Script completo para popular todas as telas e modulos do Axel CRM com dados mockados realistas
-- Organizacao padrao: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 (Axel Empreendimentos)
-- Admin principal: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12 (admin@axelcrm.com)

DO $$
DECLARE
    org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    vendedor_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    perito_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
    financeiro_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
    
    -- Clientes
    cli_construtora UUID := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01';
    cli_advocacia UUID := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02';
    cli_logistica UUID := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03';
    cli_medica UUID := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b04';

    -- Parceiros
    part_dr_ricardo UUID := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
    part_dra_beatriz UUID := 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c02';

    -- Contas Bancarias
    bank_itau UUID := 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380d01';
    bank_nubank UUID := 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380d02';
    bank_bb UUID := 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380d03';
    bank_inter UUID := 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380d04';

    -- Plano de Contas
    plan_rec_operacional UUID := 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e01';
    plan_rec_honorarios UUID := 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e02';
    plan_rec_saas UUID := 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e03';
    plan_desp_operacional UUID := 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e04';
    plan_desp_comissao UUID := 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380e05';

    -- Pipelines & Stages
    pipe_vendas UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f01';
    stage_prosp UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f11';
    stage_qualif UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f12';
    stage_prop UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f13';
    stage_negoc UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f14';
    stage_fechado UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f15';

    pipe_pericias UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f02';
    stage_intimacao UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f21';
    stage_vistoria UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f22';
    stage_laudo UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f23';
    stage_protocolo UUID := 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380f24';

    -- Negocios
    deal_saas UUID := '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    deal_pericia UUID := '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
    deal_auditoria UUID := '11eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';

    -- Processos Juridicos
    proc_civel UUID := '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    proc_trab UUID := '21eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';

    -- Projetos
    proj_engenharia UUID := '31eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    proj_implantacao UUID := '31eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';

    -- Contratos
    contract_saas UUID := '41eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    contract_pericia UUID := '41eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';

    -- Propostas
    prop_saas UUID := '51eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    prop_pericia UUID := '51eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';

    -- Regra de Comissao
    rule_comissao UUID := '61eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
    
    -- Campanha
    camp_q3 UUID := '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
BEGIN

    -- 1. Equipe / Usuarios adicionais
    INSERT INTO users (id, organization_id, email, password, name, role, active, created_at, updated_at)
    VALUES
        (vendedor_id, org_id, 'marcos.vendas@axelcrm.com', '$2a$10$Gn2EG22MGGT0w5qwanDvcegiV7gLuir56iQIA2zsmVk7acvyhEonS', 'Marcos Vinicius (Executivo de Vendas)', 'SALES', true, NOW(), NOW()),
        (perito_id, org_id, 'eng.rodrigo@axelcrm.com', '$2a$10$Gn2EG22MGGT0w5qwanDvcegiV7gLuir56iQIA2zsmVk7acvyhEonS', 'Eng. Rodrigo Alencar (Perito Judicial)', 'MANAGER', true, NOW(), NOW()),
        (financeiro_id, org_id, 'claudia.financeiro@axelcrm.com', '$2a$10$Gn2EG22MGGT0w5qwanDvcegiV7gLuir56iQIA2zsmVk7acvyhEonS', 'Claudia Mendes (Controller Financeiro)', 'MANAGER', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;

    -- 2. Plano de Contas (chart_of_accounts)
    INSERT INTO chart_of_accounts (id, organization_id, code, name, type, parent_id, level, created_at, updated_at)
    VALUES
        (plan_rec_operacional, org_id, '1.0', 'Receitas Operacionais Brutas', 'RECEITA', NULL, 1, NOW(), NOW()),
        (plan_rec_honorarios, org_id, '1.1', 'Honorários Periciais e Pareceres', 'RECEITA', plan_rec_operacional, 2, NOW(), NOW()),
        (plan_rec_saas, org_id, '1.2', 'Mensalidades e Licenças de Software', 'RECEITA', plan_rec_operacional, 2, NOW(), NOW()),
        (plan_desp_operacional, org_id, '2.0', 'Despesas Operacionais', 'DESPESA', NULL, 1, NOW(), NOW()),
        (plan_desp_comissao, org_id, '2.1', 'Comissões de Vendas e Parcerias', 'DESPESA', plan_desp_operacional, 2, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 3. Contas Bancarias com Bancos Brasileiros (Nubank, Itau, Banco do Brasil, Inter)
    INSERT INTO bank_accounts (id, organization_id, name, bank, account_number, agency, balance, active, created_at, updated_at)
    VALUES
        (bank_itau, org_id, 'Conta Corrente Principal', 'Itaú Unibanco', '45890-1', '0341', 145820.50, true, NOW(), NOW()),
        (bank_nubank, org_id, 'Reserva Operacional PJ', 'Nubank', '8841203-9', '0001', 52300.00, true, NOW(), NOW()),
        (bank_bb, org_id, 'Conta Depósitos Judiciais', 'Banco do Brasil', '19402-8', '1607', 98450.75, true, NOW(), NOW()),
        (bank_inter, org_id, 'Conta Movimento Cobrança', 'Banco Inter', '773019-2', '0001', 34210.00, true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 4. Clientes (Empresas e Escritorios)
    INSERT INTO clients (id, organization_id, name, document, email, phone, company_name, website, address, city, state, zip_code, country, industry, active, assigned_to, created_at, updated_at)
    VALUES
        (cli_construtora, org_id, 'Alpha Engenharia e Obras', '12.345.678/0001-90', 'diretoria@alphaengenharia.com.br', '(11) 3456-7890', 'Alpha Engenharia S/A', 'https://alphaengenharia.com.br', 'Av. Paulista, 1000, 15º Andar', 'São Paulo', 'SP', '01310-100', 'Brasil', 'Construção Civil', true, admin_id, NOW(), NOW()),
        (cli_advocacia, org_id, 'Moraes & Associados Advocacia', '98.765.432/0001-10', 'contato@moraesadv.com.br', '(11) 4567-8901', 'Moraes Sociedade de Advogados', 'https://moraesadv.com.br', 'Rua Funchal, 418, Cj 82', 'São Paulo', 'SP', '04551-060', 'Brasil', 'Jurídico', true, perito_id, NOW(), NOW()),
        (cli_logistica, org_id, 'Rápido Brasil Logística Express', '45.678.901/0001-23', 'financeiro@rapidobrasil.com.br', '(19) 3210-9876', 'Rápido Brasil Transportes Ltda', 'https://rapidobrasil.com.br', 'Rodovia Anhanguera, km 104', 'Campinas', 'SP', '13069-000', 'Brasil', 'Transporte e Logística', true, vendedor_id, NOW(), NOW()),
        (cli_medica, org_id, 'Hospital e Maternidade São Lucas', '67.890.123/0001-45', 'compras@saolucashospital.com.br', '(21) 2345-6789', 'São Lucas Serviços Médicos Ltda', 'https://saolucas.med.br', 'Rua das Laranjeiras, 500', 'Rio de Janeiro', 'RJ', '22240-000', 'Brasil', 'Saúde', true, admin_id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 5. Contatos dos Clientes
    INSERT INTO contacts (id, organization_id, client_id, name, email, phone, position, is_primary, notes, created_at, updated_at)
    VALUES
        ('cc11bc99-9c0b-4ef8-bb6d-6bb9bd380c01', org_id, cli_construtora, 'Eng. Carlos Eduardo', 'carlos@alphaengenharia.com.br', '(11) 98765-4321', 'Diretor de Obras', true, 'Responsável técnico pelas vistorias', NOW(), NOW()),
        ('cc22bc99-9c0b-4ef8-bb6d-6bb9bd380c02', org_id, cli_advocacia, 'Dra. Vanessa Moraes', 'vanessa@moraesadv.com.br', '(11) 97654-3210', 'Sócia Sênior Cível', true, 'Advogada solicitante de perícias contábeis e de engenharia', NOW(), NOW()),
        ('cc33bc99-9c0b-4ef8-bb6d-6bb9bd380c03', org_id, cli_logistica, 'Felipe Miranda', 'felipe@rapidobrasil.com.br', '(19) 99876-5432', 'Gerente de Operações', true, 'Responsável pela contratação de tecnologia', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 6. Parceiros Indicadores
    INSERT INTO partners (id, organization_id, name, email, phone, company, bank_details, commission_percentage, created_at, updated_at)
    VALUES
        (part_dr_ricardo, org_id, 'Dr. Ricardo Silveira', 'ricardo.silveira@advogadosilveira.com.br', '(11) 98111-2233', 'Silveira Consultoria Jurídica', 'Banco Itaú - Ag 0341 CC 99281-0 (PIX: ricardo@silveira.com.br)', 10.00, NOW(), NOW()),
        (part_dra_beatriz, org_id, 'Dra. Beatriz Fontana', 'beatriz@fontanaadvocacia.com.br', '(21) 98222-3344', 'Fontana Perícias & Advocacia', 'Nubank - PIX: beatriz@fontana.com.br', 8.50, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 7. Prospects & Leads
    INSERT INTO prospects (id, organization_id, name, email, phone, company, source, stage, notes, created_at, updated_at)
    VALUES
        ('ff11bc99-9c0b-4ef8-bb6d-6bb9bd380f01', org_id, 'Mariana Nogueira', 'mariana@innovatech.com.br', '(11) 97111-0001', 'InnovaTech Soluções', 'LINKEDIN', 'PROSPECTING', 'Procura solução para gerenciar 50 peritos credenciados.', NOW(), NOW()),
        ('ff22bc99-9c0b-4ef8-bb6d-6bb9bd380f02', org_id, 'Dr. Marcelo Guimarães', 'marcelo@guimaraesadv.com', '(31) 97222-0002', 'Guimarães & Prado Advogados', 'REFERRAL', 'CONTACTED', 'Indicado pelo Dr. Ricardo para perícia em recuperação judicial.', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO leads (id, organization_id, name, email, phone, company, position, source, stage, estimated_value, notes, assigned_to, converted, partner_id, created_at)
    VALUES
        ('ee11bc99-9c0b-4ef8-bb6d-6bb9bd380e01', org_id, 'Leonardo Vasconcelos', 'leonardo@metropoleimoveis.com.br', '(11) 98333-1111', 'Metrópole Empreendimentos', 'Diretor de Novos Negócios', 'WEBSITE', 'QUALIFIED', 38000.00, 'Interesse em laudo de avaliação patrimonial para 12 imóveis comerciais.', vendedor_id, false, part_dr_ricardo, NOW()),
        ('ee22bc99-9c0b-4ef8-bb6d-6bb9bd380e02', org_id, 'Patrícia Duarte', 'patricia@clinicasul.com.br', '(41) 98444-2222', 'Rede Clínica Sul', 'Gerente Geral', 'WHATSAPP', 'CONTACTED', 18500.00, 'Precisa de implantação de software de gestão e módulo financeiro.', vendedor_id, false, NULL, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 8. Pipelines e Estagios de Negocio
    INSERT INTO pipelines (id, organization_id, name, description, created_at, updated_at)
    VALUES
        (pipe_vendas, org_id, 'Funil de Vendas Corporativo', 'Ciclo comercial para clientes de software e consultoria', NOW(), NOW()),
        (pipe_pericias, org_id, 'Esteira de Perícias & Laudos Judiciais', 'Acompanhamento de processos judiciais, vistorias e laudos', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO pipeline_stages (id, organization_id, pipeline_id, name, order_index, created_at, updated_at)
    VALUES
        (stage_prosp, org_id, pipe_vendas, '1. Prospecção / Contato', 0, NOW(), NOW()),
        (stage_qualif, org_id, pipe_vendas, '2. Qualificação Técnica', 1, NOW(), NOW()),
        (stage_prop, org_id, pipe_vendas, '3. Proposta Enviada', 2, NOW(), NOW()),
        (stage_negoc, org_id, pipe_vendas, '4. Negociação / Minuta', 3, NOW(), NOW()),
        (stage_fechado, org_id, pipe_vendas, '5. Ganho / Fechado', 4, NOW(), NOW()),
        (stage_intimacao, org_id, pipe_pericias, '1. Intimação / Aceite', 0, NOW(), NOW()),
        (stage_vistoria, org_id, pipe_pericias, '2. Vistoria Agendada', 1, NOW(), NOW()),
        (stage_laudo, org_id, pipe_pericias, '3. Elaboração do Laudo', 2, NOW(), NOW()),
        (stage_protocolo, org_id, pipe_pericias, '4. Protocolado no Juízo', 3, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 9. Negocios (Deals)
    INSERT INTO deals (id, organization_id, lead_id, pipeline_id, stage_id, client_id, contact_id, assigned_to, title, description, value, expected_close_date, won, created_at, updated_at)
    VALUES
        (deal_saas, org_id, NULL, pipe_vendas, stage_negoc, cli_construtora, 'cc11bc99-9c0b-4ef8-bb6d-6bb9bd380c01', vendedor_id, 'Licenciamento Anual Axel CRM Enterprise', 'Contrato de 25 licenças e módulo de apontamento de obras', 24000.00, CURRENT_DATE + 15, NULL, NOW(), NOW()),
        (deal_pericia, org_id, NULL, pipe_pericias, stage_laudo, cli_advocacia, 'cc22bc99-9c0b-4ef8-bb6d-6bb9bd380c02', perito_id, 'Perícia de Engenharia Estrutural - Edifício Horizon', 'Perícia técnica para apuração de vícios construtivos em condomínio', 45000.00, CURRENT_DATE + 10, NULL, NOW(), NOW()),
        (deal_auditoria, org_id, NULL, pipe_vendas, stage_fechado, cli_logistica, 'cc33bc99-9c0b-4ef8-bb6d-6bb9bd380c03', admin_id, 'Consultoria de Governança e DRE Financeiro', 'Reestruturação do plano de contas e conciliação bancária', 18000.00, CURRENT_DATE - 5, true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 10. Catálogo de Produtos e Servicos
    INSERT INTO products (id, organization_id, name, description, sku, category, unit_price, cost_price, unit, is_active, notes, created_at)
    VALUES
        ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', org_id, 'Laudo Pericial de Engenharia Civil', 'Elaboração completa de laudo pericial com ART e vistoria técnica', 'SRV-LAUDO-ENG', 'Perícias', 15000.00, 3500.00, 'Unidade', true, 'Prazo de entrega padrão: 15 dias', NOW()),
        ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', org_id, 'Parecer Técnico de Assistência Judicial', 'Acompanhamento de perícia e manifestação aos quesitos do juiz', 'SRV-PAR-ASSIST', 'Perícias', 8500.00, 2000.00, 'Unidade', true, 'Inclui presença na vistoria judicial', NOW()),
        ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', org_id, 'Licença de Software Axel CRM (Usuário/Mês)', 'Assinatura mensal para acesso completo à plataforma multi-tenant', 'SFT-LIC-CRM', 'Software', 120.00, 15.00, 'Mês', true, 'Plano Enterprise', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 11. Processos Juridicos (legal_processes)
    INSERT INTO legal_processes (id, organization_id, cnj_number, court, distribution_date, value, status, description, created_at, updated_at)
    VALUES
        (proc_civel, org_id, '1048291-55.2025.8.26.0100', '2ª Vara Cível - Foro Central Cível TJSP', '2025-06-10', 450000.00, 'PERICIA_DETERMINADA', 'Ação indenizatória por danos estruturais em obra vizinha.', NOW(), NOW()),
        (proc_trab, org_id, '0010945-82.2025.5.02.0045', '45ª Vara do Trabalho de São Paulo - TRT2', '2025-08-20', 125000.00, 'AGUARDANDO_LAUDO', 'Reclamatória trabalhista com pedido de insalubridade e periculosidade.', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 12. Projetos e Obras / Pericias (com name e title)
    INSERT INTO projects (id, organization_id, client_id, title, name, description, status, start_date, end_date, budget, cost, legal_process_id, cnj_number, expert_type, payment_status, delivery_deadline, created_at, updated_at)
    VALUES
        (proj_engenharia, org_id, cli_construtora, 'Perícia Técnica Estrutural - Edifício Horizon', 'Perícia Técnica Estrutural - Edifício Horizon', 'Vistoria, medição de fissuras e cálculo de estabilidade estrutural.', 'IN_PROGRESS', CURRENT_DATE - 10, CURRENT_DATE + 20, 45000.00, 8500.00, proc_civel, '1048291-55.2025.8.26.0100', 'Engenharia Civil', 'PARCIALLY_PAID', CURRENT_DATE + 12, NOW(), NOW()),
        (proj_implantacao, org_id, cli_logistica, 'Implantação do Sistema de Gestão Financeira', 'Implantação do Sistema de Gestão Financeira', 'Parametrização do plano de contas, treinamento e conciliação bancária.', 'IN_PROGRESS', CURRENT_DATE - 25, CURRENT_DATE + 30, 18000.00, 3200.00, NULL, NULL, NULL, 'PAID', CURRENT_DATE + 30, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 13. Tarefas (Tasks)
    INSERT INTO tasks (id, organization_id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
    VALUES
        ('a11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, proj_engenharia, 'Realizar Vistoria Presencial no Imóvel', 'Coleta de evidências fotográficas, ensaio de esclerometria e medição de trincas.', 'DONE', 'HIGH', CURRENT_DATE - 3, perito_id, NOW(), NOW()),
        ('a12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, proj_engenharia, 'Redigir Resposta aos Quesitos do Juiz', 'Elaborar respostas técnicas aos 14 quesitos formulados pelas partes.', 'IN_PROGRESS', 'URGENT', CURRENT_DATE + 5, perito_id, NOW(), NOW()),
        ('a13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, proj_implantacao, 'Conciliar Extratos Bancários com Plano de Contas', 'Validar lançamentos bancários de Itaú e Nubank do mês corrente.', 'PENDING', 'MEDIUM', CURRENT_DATE + 4, financeiro_id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 14. Eventos de Calendario (Calendar Events)
    INSERT INTO calendar_events (id, organization_id, user_id, title, description, start_time, end_time, location, all_day, created_at, updated_at)
    VALUES
        ('c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, perito_id, 'Vistoria Judicial - Edifício Horizon', 'Vistoria presencial acompanhada dos assistentes técnicos das partes.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'Av. das Nações Unidas, 14401 - SP', false, NOW(), NOW()),
        ('c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, vendedor_id, 'Reunião de Fechamento de Proposta - Alpha Engenharia', 'Apresentação do escopo do contrato e alinhamento de cronograma.', NOW() + INTERVAL '4 days 2 hours', NOW() + INTERVAL '4 days 3 hours', 'Google Meet / Online', false, NOW(), NOW()),
        ('c13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, perito_id, 'Prazo Fatal: Protocolo do Laudo Pericial', 'Data limite fixada pelo MM. Juiz para juntada do laudo nos autos.', NOW() + INTERVAL '12 days', NOW() + INTERVAL '12 days 1 hour', 'Portal PJe TJSP', false, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 15. Apontamento de Horas (Time Entries)
    INSERT INTO time_entries (id, organization_id, user_id, task_id, project_id, start_time, end_time, duration_minutes, description, created_at, updated_at)
    VALUES
        ('d11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, perito_id, 'a11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', proj_engenharia, NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days', 240, 'Vistoria técnica presencial com medição a laser e registros fotográficos.', NOW(), NOW()),
        ('d12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, perito_id, 'a12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', proj_engenharia, NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day', 180, 'Análise dos autos processuais e estruturação da minuta inicial do laudo.', NOW(), NOW()),
        ('d13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, financeiro_id, 'a13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', proj_implantacao, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 hours', 120, 'Configuração e testes do plano de contas para relatórios DRE.', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 16. Propostas e Itens de Proposta
    INSERT INTO proposals (id, organization_id, client_id, lead_id, title, description, status, total_value, valid_until, notes, created_by, partner_id, lawyer_name, referral_source, expert_user_id, technical_manager_user_id, project_id, proposal_code, public_token, created_at, updated_at)
    VALUES
        (prop_pericia, org_id, cli_advocacia, NULL, 'Proposta de Honorários Periciais de Engenharia', 'Atuação como Assistente Técnico em ação indenizatória cível.', 'ACCEPTED', 45000.00, CURRENT_DATE + 30, 'Honorários fixados em 3 parcelas de R$ 15.000,00.', perito_id, part_dr_ricardo, 'Dr. Ricardo Silveira', 'INDICACAO_PARCEIRO', perito_id, perito_id, proj_engenharia, 'PROP-2026-0042', '811ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', NOW(), NOW()),
        (prop_saas, org_id, cli_construtora, NULL, 'Proposta Comercial - Licenciamento Axel CRM', 'Fornecimento de software SaaS para 25 usuários simultâneos.', 'SENT', 24000.00, CURRENT_DATE + 15, 'Inclui 20 horas de suporte técnico e treinamento.', vendedor_id, NULL, NULL, 'WEBSITE', admin_id, admin_id, NULL, 'PROP-2026-0043', '812ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO proposal_items (id, organization_id, proposal_id, description, quantity, unit_price, total_price, created_at, updated_at)
    VALUES
        ('e11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, prop_pericia, 'Vistoria Técnica Presencial e Ensaio de Resistência', 1, 15000.00, 15000.00, NOW(), NOW()),
        ('e12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, prop_pericia, 'Elaboração do Laudo Pericial Fundamentado', 1, 20000.00, 20000.00, NOW(), NOW()),
        ('e13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, prop_pericia, 'Acompanhamento dos Quesitos e Esclarecimentos', 1, 10000.00, 10000.00, NOW(), NOW()),
        ('e14ebc99-9c0b-4ef8-bb6d-6bb9bd380a04', org_id, prop_saas, 'Assinatura Anual Axel CRM Enterprise (25 usuários)', 12, 2000.00, 24000.00, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 17. Contratos (Contracts)
    INSERT INTO contracts (id, organization_id, title, contract_number, description, client_id, deal_id, start_date, end_date, value, monthly_value, status, terms, auto_renew, created_at, updated_at)
    VALUES
        (contract_saas, org_id, 'Contrato de Licenciamento SaaS - Alpha Engenharia', 'CTR-2026-001', 'Fornecimento de licenças de software Axel CRM.', cli_construtora, deal_saas, CURRENT_DATE - 30, CURRENT_DATE + 335, 24000.00, 2000.00, 'ACTIVE', 'Renovação anual automática.', true, NOW(), NOW()),
        (contract_pericia, org_id, 'Contrato de Prestação de Serviços Periciais Forenses', 'CTR-2026-002', 'Assistência técnica em processo cível.', cli_advocacia, deal_pericia, CURRENT_DATE - 15, CURRENT_DATE + 180, 45000.00, 15000.00, 'ACTIVE', 'Pagamento vinculado aos marcos de entrega do laudo.', false, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 18. Faturas (Invoices)
    INSERT INTO invoices (id, organization_id, invoice_number, client_id, contract_id, issue_date, due_date, paid_date, status, subtotal, tax_amount, discount_amount, total, payment_method, paid_amount, created_at, updated_at)
    VALUES
        ('f11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, 'FAT-2026-0010', cli_advocacia, contract_pericia, CURRENT_DATE - 15, CURRENT_DATE - 5, CURRENT_DATE - 5, 'PAID', 15000.00, 750.00, 0.00, 15000.00, 'PIX', 15000.00, NOW(), NOW()),
        ('f12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, 'FAT-2026-0011', cli_advocacia, contract_pericia, CURRENT_DATE, CURRENT_DATE + 15, NULL, 'SENT', 15000.00, 750.00, 0.00, 15000.00, 'BOLETO', 0.00, NOW(), NOW()),
        ('f13ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, 'FAT-2026-0012', cli_construtora, contract_saas, CURRENT_DATE - 5, CURRENT_DATE + 10, NULL, 'SENT', 2000.00, 100.00, 0.00, 2000.00, 'BOLETO', 0.00, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 19. Transacoes Financeiras (financial_transactions)
    INSERT INTO financial_transactions (id, organization_id, client_id, type, description, amount, category, transaction_date, due_date, paid_at, paid, payment_method, bank_account_id, deal_id, chart_account_id, created_at, updated_at)
    VALUES
        ('121ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, cli_advocacia, 'INCOME', 'Recebimento 1ª Parcela Honorários - Edifício Horizon', 15000.00, 'Honorários Periciais', CURRENT_DATE - 5, CURRENT_DATE - 5, NOW() - INTERVAL '5 days', true, 'PIX', bank_itau, deal_pericia, plan_rec_honorarios, NOW(), NOW()),
        ('122ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, cli_construtora, 'INCOME', 'Mensalidade Licença Axel CRM - Competência Agosto', 2000.00, 'Mensalidades SaaS', CURRENT_DATE - 10, CURRENT_DATE - 10, NOW() - INTERVAL '10 days', true, 'BOLETO', bank_nubank, deal_saas, plan_rec_saas, NOW(), NOW()),
        ('123ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, NULL, 'EXPENSE', 'Comissão Comercial - Fechamento Alpha Engenharia', 2400.00, 'Comissões', CURRENT_DATE - 2, CURRENT_DATE - 2, NOW() - INTERVAL '2 days', true, 'PIX', bank_itau, deal_saas, plan_desp_comissao, NOW(), NOW()),
        ('124ebc99-9c0b-4ef8-bb6d-6bb9bd380a04', org_id, NULL, 'EXPENSE', 'Licenças de Servidores Cloud e Banco de Dados', 1850.00, 'Infraestrutura de TI', CURRENT_DATE - 8, CURRENT_DATE - 8, NOW() - INTERVAL '8 days', true, 'CARTAO', bank_nubank, NULL, plan_desp_operacional, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 20. Regras de Comissao e Comissoes Pagas
    INSERT INTO commission_rules (id, organization_id, name, description, percentage, min_value, max_value, active, created_at, updated_at)
    VALUES
        (rule_comissao, org_id, 'Comissão Padrão Executivo de Vendas', '10% sobre valor total de contratos fechados', 0.1000, 1000.00, 500000.00, true, NOW(), NOW()),
        ('61eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, 'Comissão Parceiro Indicador Jurídico', '8% sobre honorários periciais indicados', 0.0800, 5000.00, 200000.00, true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO commissions (id, organization_id, deal_id, user_id, rule_id, deal_value, amount, paid, paid_at, partner_id, role, created_at, updated_at)
    VALUES
        ('131ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, deal_saas, vendedor_id, rule_comissao, 24000.00, 2400.00, true, NOW() - INTERVAL '2 days', NULL, 'SELLER', NOW(), NOW()),
        ('132ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, deal_pericia, NULL, '61eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 45000.00, 3600.00, false, NULL, part_dr_ricardo, 'PARTNER', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 21. Campanhas de Marketing e E-mail
    INSERT INTO campaigns (id, organization_id, name, type, content, scheduled_at, sent_at, recipients_count, sent_count, open_count, click_count, status, created_by, created_at, updated_at)
    VALUES
        (camp_q3, org_id, 'Campanha Q3: Perícias de Engenharia para Construtoras', 'EMAIL', 'Prezado gestor, conheça nossas soluções periciais para apuração de vícios construtivos e assessoria técnica.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 350, 348, 142, 48, 'ENVIADA', admin_id, NOW(), NOW()),
        ('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, 'Aviso de Atualização: Nova Área de Portal do Parceiro', 'WHATSAPP', 'Olá! Agora você pode acompanhar o status de suas perícias em tempo real pelo portal.', NOW() + INTERVAL '3 days', NULL, 85, 0, 0, 0, 'AGENDADA', admin_id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 22. Mensagens e WhatsApp Inbox
    INSERT INTO messages (id, organization_id, lead_id, client_id, user_id, channel, direction, sender, recipient, subject, body, status, sent_at, is_read, created_at, updated_at)
    VALUES
        ('141ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, NULL, cli_advocacia, perito_id, 'WHATSAPP', 'INBOUND', '(11) 97654-3210', '(11) 3456-7890', 'Quesitos Periciais', 'Olá Dr. Rodrigo, acabamos de protocolar os quesitos suplementares no processo.', 'DELIVERED', NOW() - INTERVAL '2 hours', true, NOW(), NOW()),
        ('142ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, NULL, cli_advocacia, perito_id, 'WHATSAPP', 'OUTBOUND', '(11) 3456-7890', '(11) 97654-3210', 'Resposta Quesitos', 'Perfeito Dra. Vanessa! Já incluí na pauta para análise técnica.', 'SENT', NOW() - INTERVAL '1 hour', true, NOW(), NOW()),
        ('143ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, 'ee11bc99-9c0b-4ef8-bb6d-6bb9bd380e01', NULL, vendedor_id, 'EMAIL', 'INBOUND', 'leonardo@metropoleimoveis.com.br', 'contato@axelcrm.com', 'Solicitação de Proposta', 'Gostaria de agendar uma reunião técnica nesta quinta-feira.', 'DELIVERED', NOW() - INTERVAL '4 hours', false, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 23. Chamados de Suporte (Support Tickets)
    INSERT INTO support_tickets (id, organization_id, client_id, subject, description, status, priority, assigned_to, created_by, created_at, updated_at)
    VALUES
        ('151ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, cli_construtora, 'Dúvida na exportação do relatório DRE em PDF', 'Cliente solicita auxílio para gerar DRE consolidada com filtro de 12 meses.', 'IN_PROGRESS', 'MEDIUM', financeiro_id, admin_id, NOW() - INTERVAL '1 day', NOW()),
        ('152ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, cli_logistica, 'Solicitação de inclusão de novo operador no portal', 'Cadastrar mais 2 analistas com perfil VIEWER.', 'RESOLVED', 'LOW', admin_id, admin_id, NOW() - INTERVAL '4 days', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 24. Documentos Anexos (documents)
    INSERT INTO documents (id, organization_id, name, description, category, tags, file_name, file_type, file_size, file_url, client_id, project_id, document_date, is_archived, created_at, updated_at)
    VALUES
        ('161ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, 'Laudo Técnico Pericial Preliminar - Edifício Horizon', 'Minuta completa do laudo com relatório fotográfico e conclusões.', 'Laudos Periciais', 'pericia,engenharia,laudo,horizon', 'laudo_pericial_horizon_v1.pdf', 'application/pdf', 5420000, 'https://storage.axelcrm.com/laudos/laudo_horizon.pdf', cli_advocacia, proj_engenharia, CURRENT_DATE - 3, false, NOW(), NOW()),
        ('162ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, 'Contrato Social Registrado - Alpha Engenharia', 'Cópia autenticada do contrato social para validação cadastral.', 'Contratos', 'societario,documentos,alpha', 'contrato_social_alpha.pdf', 'application/pdf', 1840000, 'https://storage.axelcrm.com/docs/contrato_alpha.pdf', cli_construtora, NULL, CURRENT_DATE - 20, false, NOW(), NOW()),
        ('163ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, 'Certidão de Distribuição Cível TJSP', 'Certidão do processo 1048291-55.2025.', 'Processos', 'certidao,tjsp,distribuicao', 'certidao_tjsp_1048291.pdf', 'application/pdf', 620000, 'https://storage.axelcrm.com/docs/certidao_tjsp.pdf', cli_advocacia, proj_engenharia, CURRENT_DATE - 15, false, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 25. Notificacoes do Sistema (Notifications)
    INSERT INTO notifications (id, organization_id, user_id, title, message, entity_type, entity_id, is_read, created_at, updated_at)
    VALUES
        ('171ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, admin_id, 'Proposta Aceita pelo Cliente!', 'A proposta PROP-2026-0042 (R$ 45.000,00) foi aprovada pelo cliente Moraes Advocacia.', 'PROPOSAL', prop_pericia::TEXT, false, NOW() - INTERVAL '2 hours', NOW()),
        ('172ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, perito_id, 'Vistoria Judicial em 48h', 'Lembrete: Vistoria presencial no Edifício Horizon agendada para quinta-feira.', 'CALENDAR_EVENT', 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', false, NOW() - INTERVAL '4 hours', NOW()),
        ('173ebc99-9c0b-4ef8-bb6d-6bb9bd380a03', org_id, financeiro_id, 'Fatura Paga com Sucesso', 'A fatura FAT-2026-0010 de R$ 15.000,00 foi quitada via PIX.', 'INVOICE', 'f11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', true, NOW() - INTERVAL '1 day', NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 26. Logs de Auditoria (audit_logs)
    INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, old_values, new_values, created_at)
    VALUES
        ('181ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', org_id, perito_id, 'UPDATE_STATUS', 'PROPOSAL', prop_pericia::TEXT, '{"status": "SENT"}', '{"status": "ACCEPTED"}', NOW() - INTERVAL '2 hours'),
        ('182ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', org_id, financeiro_id, 'MARK_PAID', 'INVOICE', 'f11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '{"status": "SENT", "paid": false}', '{"status": "PAID", "paid": true}', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;

END $$;
