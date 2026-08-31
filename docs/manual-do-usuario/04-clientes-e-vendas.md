# 04 — Clientes e vendas

Este capítulo cobre o grupo **CRM** do menu. A sequência natural do trabalho é:

```
Prospecção  →  Lead  →  Cliente
                 ↓
              Negócio  →  Proposta
```

Cada etapa tem sua tela, e o sistema faz a passagem de uma para a outra sem você redigitar nada.

## Prospecção

É o topo do funil: gente que você quer abordar, mas com quem ainda não houve conversa qualificada.

**Cadastrar.** Clique em **Novo** e informe nome, empresa, e-mail, telefone e a **origem** (site, redes sociais, indicação, e-mail, telefone, evento, anúncio, parceiro ou outro).

**Fases.** Cada prospect fica em uma destas três:

| Fase | Quando usar |
| --- | --- |
| **Prospecção** | Ainda não houve contato |
| **Contato Realizado** | Você já falou com a pessoa |
| **Aguardando Resposta** | A bola está com ela |

**Promover a lead.** Quando o contato demonstra interesse real, clique em **Promover** na linha do prospect. O sistema cria um lead com os mesmos dados, no estágio *Novo*, e marca o prospect como convertido. O botão some depois — cada prospect vira lead uma única vez.

## Leads

Lead é a oportunidade em negociação. É aqui que fica o grosso do trabalho comercial.

**Cadastrar.** Nome é obrigatório. Preencha também e-mail, telefone, empresa, cargo, **origem**, **estágio** e o **valor estimado** — esse valor alimenta o indicador do painel e a pontuação do lead.

**Estágios:** Novo, Contatado, Qualificado, Proposta, Negociação, Convertido, Perdido.

**Mover de estágio.** Na visualização em quadro, arraste o cartão do lead para a coluna desejada. O sistema salva na hora e confirma no rodapé.

**Pontuação (score).** Cada lead recebe uma nota de 0 a 100 que indica o quanto ele é promissor. A nota leva em conta:

- o **valor estimado** — quanto maior, mais pontos;
- a **origem** — indicação e evento valem mais que telefone ou anúncio;
- **quando foi o último contato** — quem foi contatado nos últimos dias pontua mais;
- **há quanto tempo o lead existe** — leads recentes pontuam mais que antigos.

A nota é recalculada quando você pede, pelo botão de recalcular. Ela serve para priorizar a fila do dia: comece pelos de nota mais alta.

**Tela de detalhe.** Clique no lead para abrir. Ali você tem:

| Aba | Conteúdo |
| --- | --- |
| **Dados do Lead** | Contato, empresa, qualificação e notas internas — use **Editar** para alterar |
| **Linha do Tempo** | Tudo que aconteceu com o lead, em ordem |
| **Tarefas** | Tarefas ligadas ao lead, com botão para criar novas |

**Converter em cliente.** No detalhe do lead, clique em **Converter em Cliente**. O sistema cria o cliente com os dados do lead, marca o lead como *Convertido* e registra a data. A partir daí o botão vira um atalho para o cliente criado.

Converter o mesmo lead duas vezes não gera cliente duplicado — o sistema devolve o cliente que já existe.

## Clientes

Quem já fechou negócio com você.

**Cadastrar.** Nome é obrigatório. Há campos para e-mail, telefone, empresa, CPF/CNPJ, site, setor, **tipo de serviço** (Consultoria, Desenvolvimento, Design, Marketing, Jurídico ou Outros), endereço completo e **status**.

**Status do cliente:** Novo, Em Contato, Qualificado, Aguardando Resposta, Fechado Ganho, Perdido, Descartado.

**Tela de detalhe.** Reúne tudo do cliente em cinco abas: dados cadastrais, histórico de interações, arquivos anexados, negócios e tarefas, propostas e projetos. É a tela para abrir antes de uma reunião — ela mostra a relação inteira em um lugar.

**Anexos.** Na aba **Arquivos & Anexos** você envia documentos do cliente (contrato assinado, documentos pessoais, laudos). Cada arquivo tem botão para baixar e para excluir.

## Contatos

As pessoas dentro de um cliente. Um mesmo cliente pode ter vários contatos — o jurídico, o financeiro, quem assina.

Cada contato tem um tipo: **Advogado**, **Juiz**, **Cliente**, **Assistente Técnico** ou **Outro**.

Ao criar um negócio, você pode indicar qual contato é o interlocutor daquela oportunidade.

## Negócios

O negócio é a oportunidade concreta, com valor e previsão de fechamento.

**Cadastrar.** Informe título, valor, **pipeline**, **estágio**, **cliente** e, opcionalmente, contato relacionado, descrição e previsão de fechamento. Os estágios disponíveis mudam conforme o pipeline escolhido.

**Duas visualizações.** No topo direito você alterna entre:

- **Quadro (Kanban)** — uma coluna por estágio; arraste os cartões para mover
- **Lista** — tabela com título, cliente, estágio, valor e previsão

**Mover de estágio.** Arraste o cartão para outra coluna. O sistema confirma o movimento e guarda **quanto tempo** o negócio ficou em cada etapa — é assim que se descobre onde as vendas costumam travar.

Três regras a conhecer:

1. Um negócio **ganho** não muda mais de estágio.
2. Um negócio **perdido** precisa ser reaberto antes de voltar a andar.
3. Para **voltar** um negócio a um estágio anterior, o sistema exige uma justificativa. Não é burocracia: é o que permite depois entender por que negócios regridem.

**Ganhar.** Ao mover o negócio para o **último estágio do pipeline**, ele é automaticamente marcado como ganho e a data de fechamento é registrada.

**Perder.** Use a ação de marcar como perdido e informe o motivo. O negócio sai do funil ativo, mas o histórico fica.

**Reabrir.** Um negócio fechado por engano pode ser reaberto — ele volta ao estágio em que estava.

**Virar projeto.** Um negócio ganho pode ser convertido em projeto direto pela ação correspondente.

## Pipelines

O pipeline é o desenho do seu processo de vendas: a sequência de etapas por onde os negócios passam.

Você pode ter mais de um — por exemplo, um para vendas novas e outro para renovações.

**Criar etapas.** Dentro do pipeline, cadastre os estágios na ordem em que acontecem. A **ordem importa**: o sistema entende o último estágio como "negócio ganho". Deixe-o sempre como a etapa final de sucesso (*Fechado*, *Ganho*, *Contratado*).

**Antes de mudar um pipeline em uso**, lembre que os negócios existentes já estão distribuídos nas etapas atuais. Apagar ou reordenar etapas afeta o funil inteiro.

## Parceiros / Indicadores

Quem traz negócio para você e recebe por isso.

Cadastre o parceiro aqui e, na proposta, informe-o junto com o percentual dele. Quando o dinheiro entrar, o sistema calcula a comissão automaticamente — veja [Financeiro](06-financeiro.md).

## Agenda

Compromissos da equipe: reuniões, visitas, prazos. Cadastre título, data, horário e descrição.
