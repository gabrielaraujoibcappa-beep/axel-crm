# 07 — Regras de negócio

Este documento descreve os fluxos que envolvem mais do que CRUD. Para os demais módulos, o comportamento é o CRUD padrão descrito em [API REST](05-api-rest.md).

## Funil comercial

```
Prospect ──promote──> Lead ──convert──> Client
                        │
                        └──> Deal ──proposta aceita──> Project ──> Invoice
```

### Prospect → Lead

`POST /api/v1/prospects/{id}/promote` (`ProspectService.promoteToLead`)

Copia nome, e-mail, telefone, empresa, origem e anotações para um novo `Lead` no estágio `NEW`. O prospect passa a apontar para o lead criado (`convertedLead`) e recebe `convertedAt`. Um prospect já convertido não pode ser promovido de novo.

### Lead → Client

`POST /api/v1/leads/{id}/convert` (`LeadConversionService.convertLeadToClient`)

Cria um `Client` a partir do lead (nome, e-mail, telefone, empresa → `companyName`, anotações, responsável), marca o lead como `CONVERTED`, grava `convertedAt` e o vínculo `convertedClient`, e registra um log de auditoria com ação `CONVERT`.

A operação é **idempotente**: se o lead já está `CONVERTED` e tem cliente vinculado, o cliente existente é devolvido em vez de um duplicado.

## Lead scoring

`POST /api/v1/leads/{id}/recalculate-score` (`LeadScoringService.recalculate`)

O score é recalculado somando quatro componentes e depois limitado ao intervalo **0–100**.

**1. Valor estimado** — 1 ponto a cada R$ 100 (arredondamento para baixo).

**2. Qualidade da origem:**

| Origem | Pontos |
| --- | --- |
| `REFERRAL` | 30 |
| `EVENT` | 25 |
| `WEBSITE` | 20 |
| `SOCIAL_MEDIA` | 15 |
| `EMAIL` | 10 |
| `PHONE` | 5 |
| demais | 8 |

**3. Contato recente** (`lastContactAt`): até 3 dias → +20; até 7 dias → +10; até 30 dias → +5.

**4. Recência do cadastro** (`createdAt`): até 7 dias → +15; até 30 dias → +10; até 90 dias → +5.

O cálculo é sob demanda — não há job periódico recalculando scores.

## Motor de pipeline

`PipelineEngine` centraliza as mudanças de estágio de um negócio e é a única via que grava `deal_stage_history`. Todas as operações são transacionais e geram log de auditoria.

### Transição de estágio

`POST /api/v1/deals/{id}/transition` — corpo com `targetStageId` e `reason` opcional.

Regras aplicadas, nesta ordem:

1. Negócio já **ganho** não pode mudar de estágio.
2. Negócio já **perdido** precisa ser reaberto antes.
3. O estágio de destino precisa pertencer ao **mesmo pipeline** do negócio.
4. Movimento **regressivo** (posição de destino menor que a atual) exige justificativa em `reason` — sem ela, `400`.

Executadas as validações, o motor:

1. fecha o registro aberto em `deal_stage_history`, preenchendo `leftAt` e `durationSeconds`;
2. move o negócio para o estágio de destino;
3. se o destino for o **último estágio do pipeline**, marca `won = true` e preenche `closedAt`;
4. abre um novo registro de histórico com `enteredAt`, motivo e autor;
5. registra auditoria `STAGE_TRANSITION` com o estágio anterior e o novo.

### Marcar como perdido

`POST /api/v1/deals/{id}/mark-lost` — recusa negócios já ganhos. Fecha o histórico corrente, define `won = false` e `closedAt`, e audita `DEAL_LOST` com o motivo.

### Reabrir

`POST /api/v1/deals/{id}/reopen` — recusa negócios que não estão fechados. Zera `won` e `closedAt`, abre novo registro de histórico no estágio atual e audita `DEAL_REOPENED`.

### Duração por estágio

Cada linha de `deal_stage_history` guarda `enteredAt`, `leftAt` e `durationSeconds`, o que permite medir tempo médio por estágio e identificar gargalos do funil.

## Propostas

### Cálculo do total

Ao criar ou atualizar, o total é a soma dos itens menos `discountAmount`. Os itens são persistidos junto (`proposal_items`).

### Campos jurídicos e periciais

A proposta registra o contexto do caso além do comercial:

| Campo | Regra |
| --- | --- |
| **Advogado vinculado** | FK para um `Contact` da organização. Omitir o campo no request limpa o vínculo; contato inexistente resulta em `404`. |
| **Nome do advogado** | Texto livre, gravado **apenas** quando não há contato vinculado. Com contato, o campo é zerado e a leitura devolve o nome do contato. |
| **Origem da indicação** | Valor de `LeadSource`. Quem indicou continua sendo o `partner`, que carrega a taxa de comissão. |
| **Perito responsável** | FK para `User`. Registro de responsabilidade — **não** entra no rateio de comissão. |
| **Responsável técnico** | FK para `User`. Mesma regra do perito. |
| **Projeto vinculado** | FK para um `Project` da organização. |

Todos seguem a convenção dos demais relacionamentos da proposta: campo ausente no request limpa o valor atual.

### Aprovação e ações automáticas

Quando o status passa a `ACCEPTED`, o serviço grava `approvedAt` e dispara `triggerPostApprovalActions`:

1. **Avança o negócio vinculado** — se a proposta tem `deal`, o negócio é movido para o **último estágio do pipeline** com o motivo `"Aprovação automática via Proposta comercial"`. Como é o estágio final, o negócio é marcado como ganho.
2. **Cria o projeto** — se a proposta **já tem um projeto vinculado**, nada é criado. Caso contrário, e se ainda não existir projeto com `sourceProposalId` igual ao da proposta, um é criado com:
   - nome `"Projeto: <título da proposta>"`
   - descrição, cliente e responsável herdados da proposta
   - `startDate` = hoje, `endDate` = hoje + 3 meses
   - `budget` = total da proposta, `cost` = 0
   - `status` = `"PLANEJAMENTO"`

   O projeto criado passa a ser o **projeto vinculado** da proposta.

Duas proteções contra duplicação: o vínculo direto (`Proposal.project`) e a checagem por `sourceProposalId`, que cobre propostas salvas mais de uma vez como aceitas.

### Conversão manual

`POST /api/v1/proposals/{id}/convert-to-project` faz a mesma criação de projeto e vincula o resultado à proposta. Responde `400` quando:

- a proposta não está `ACCEPTED` — *"A proposta precisa estar aprovada (ACCEPTED) para ser convertida em projeto."*
- a proposta já tem projeto vinculado — *"Esta proposta já possui um projeto vinculado."*

`POST /api/v1/deals/{id}/convert-to-project` cria o projeto a partir de um negócio (`ProjectService.createFromDeal`).

### Link público

Cada proposta recebe um `publicToken` (UUID). O cliente acessa `GET /api/v1/proposals/public/{token}` (ou `/pdf`) sem autenticação, e a SPA renderiza em `/public/proposals/:token`. O token não expira e não há segundo fator.

### PDF

`ProposalService` gera o PDF com OpenPDF, tanto na rota autenticada quanto na pública. `InvoiceService` faz o mesmo para faturas (`/invoices/{id}/pdf` e `/invoices/report/pdf`).

## Comissões

Existem dois caminhos de apuração.

**Manual / por regra.** Ao criar ou atualizar uma comissão, se `amount` não vier informado e houver uma `CommissionRule` aplicável, o valor é `dealValue × rule.percentage`.

**Multinível a partir da proposta.** `calculateCommissionsForTransaction` roda a partir de uma transação financeira e distribui a comissão entre até quatro papéis definidos na proposta:

| Papel | Beneficiário | Percentual |
| --- | --- | --- |
| `CAPTURE` | `captureUser` | `captureRate` |
| `SELLER` | `sellerUser` | `sellerRate` |
| `PARTNER` | `partner` | `partnerRate` |
| `COLLABORATOR` | `collaboratorUser` | `collaboratorRate` |

Cada comissão vale `valor da transação × taxa do papel` e só é criada quando o beneficiário existe e a taxa é maior que zero. Como a base é o valor da transação, comissões são apuradas conforme o dinheiro entra, não no fechamento do negócio.

`payCommission` marca a comissão como paga.

## Apontamento de horas

`TimeEntryService` aceita `durationMinutes` explícito. Quando ele não vem, mas `startTime` e `endTime` estão preenchidos, a duração é calculada automaticamente pela diferença entre os dois. O shell tem um cronômetro global (`TimerComponent`) para alimentar esse registro durante o trabalho.

## Campanhas

`POST /api/v1/campaigns/{id}/send` monta a lista de destinatários (`campaign_recipients`) a partir de **todos** os leads e clientes da organização que tenham e-mail ou telefone, e marca a campanha como enviada. Uma campanha já enviada não pode ser reenviada.

O envio é uma **simulação**: os destinatários são gravados, mas nenhuma mensagem é efetivamente disparada — não há integração de e-mail ou WhatsApp conectada a esse fluxo. Veja [Pontos de atenção](10-pontos-de-atencao.md).

## Plano de contas

`GET /api/v1/chart-of-accounts/tree` devolve a hierarquia montada de contas; `POST /import` importa um plano padrão. Os tipos disponíveis são `RECEITA`, `DESPESA`, `ATIVO` e `PASSIVO`.

## Relatórios financeiros

| Endpoint | Relatório |
| --- | --- |
| `/financial-reports/cash-flow` | Fluxo de caixa |
| `/financial-reports/income-statement` | Demonstração de resultado |
| `/reports/dre` | DRE |
| `/reports/dfc` | DFC |

Os números do dashboard vêm das views analíticas descritas em [Modelo de dados](04-modelo-de-dados.md).
