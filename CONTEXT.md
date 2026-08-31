# Axel CRM

CRM multi-tenant de operação comercial, operacional e financeira. Este glossário trava a linguagem do domínio — sem detalhes de implementação.

## Language

**Atendente automático**:
O agente no WhatsApp que conversa com o contato (lead ou cliente) antes de um humano da equipe, conduzido por Roteiro.
_Avoid_: chatbot, bot, copiloto, assistente interno, IA

**Roteiro**:
A conversa do atendente por menu numerado e textos cadastrados, sem modelo de linguagem. Fora do horário comercial o atendente continua respondendo pelo Roteiro.
_Avoid_: IA, LLM, conversa livre

**Playbook**:
A configuração do atendente por organização: campos estruturados (saudação, cadastro, FAQ, tipos de agenda, texto fora do expediente) mais um texto livre opcional. A v1 executa só os campos estruturados; o texto livre fica guardado e o Roteiro não o interpreta.
_Avoid_: prompt, base de conhecimento, PDF que o atendente “lê”

**Agendamento**:
O compromisso que o atendente marca no calendário do CRM.
_Avoid_: reunião avulsa, lembrete

**Status**:
O resumo que o atendente mostra ao Cliente: propostas (código, situação, link público), faturas (número, vencimento, valor, paga/em aberto) e processos (número, situação). Sem PDF, sem itens, sem anexo.
_Avoid_: extrato, portal, detalhamento financeiro

**Inbox**:
A superfície onde a equipe humana lê e responde conversas de WhatsApp já roteadas para um humano.
_Avoid_: chat interno, WhatsApp Web

**Conversa**:
O fio de mensagens com um número de telefone, eventualmente vinculado a um registro do CRM.
_Avoid_: ticket, thread, chat

**Lead**:
Interesse comercial ainda não convertido em cliente.
_Avoid_: prospect (é o estágio anterior), cliente

**Cliente**:
Registro depois da conversão; titular de proposta, processo e fatura.
_Avoid_: lead, cadastro, conta

**Conversão**:
A passagem de Lead a Cliente. O atendente só a dispara depois de uma proposta aceita.
_Avoid_: cadastro, promoção

**Proposta aceita**:
O compromisso comercial dado na página pública da proposta (não no WhatsApp) que autoriza a conversão.
_Avoid_: sim no chat, cadastro completo

**Transferência**:
O pedido explícito do contato para falar com um humano; a conversa passa à Inbox.
_Avoid_: handoff, escalada automática, timeout

**Silêncio**:
Estado da conversa em que o atendente não responde, depois de uma Transferência ou de um humano ter escrito nela. Só a equipe encerra o Silêncio, devolvendo a conversa ao atendente pela Inbox.
_Avoid_: desligado, pausa, mute, expiração automática
