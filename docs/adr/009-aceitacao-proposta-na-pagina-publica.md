# ADR-009: Aceitação da proposta na página pública

- **Data**: 2026-08-17
- **Status**: Accepted
- **Decisores**: Equipe do Axel CRM
- **Tags**: domínio, propostas, WhatsApp, conversão

## Contexto e Problema

O atendente automático no WhatsApp cadastra Lead e só converte para Cliente depois de uma proposta aceita. Era preciso decidir *onde* o contato dá esse “sim”. A página pública hoje só lê a proposta e baixa o PDF; quem marca `ACCEPTED` é a equipe autenticada no CRM. Aceitar por texto no chat (“aceito”) é ambíguo (aceito o quê, de qual versão) e frágil como compromisso comercial.

## Drivers de Decisão

- O compromisso comercial é o documento da proposta, não a mensagem de WhatsApp.
- Conversão `Lead → Cliente` pelo atendente não pode disparar sem um “sim” amarrado à proposta.
- A página pública e o token já existem; falta o ato de aceitar.

## Opções Consideradas

- Aceitar na página pública (link + botão no documento)
- Aceitar dizendo “aceito” no WhatsApp (o atendente muda o status)
- A equipe continua marcando `ACCEPTED` no CRM; o atendente só reage

## Resultado da Decisão

Opção escolhida: **aceitação na página pública**. O atendente envia o link da proposta; o contato aceita no documento. A equipe marcando no CRM continua válida como ponte até o botão existir. O atendente **não** interpreta texto solto no WhatsApp como aceitação de proposta.

### Consequências

- É preciso um endpoint público autenticado por token para aceitar (hoje só há GET e PDF).
- Depois de `ACCEPTED`, o atendente converte o Lead vinculado e destrava status (fatura/processo/proposta).
- “Aceito” no chat não muda status de proposta.
