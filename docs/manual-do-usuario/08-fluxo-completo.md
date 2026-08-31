# 08 — Do primeiro contato ao recebimento

Este capítulo percorre o ciclo inteiro em um exemplo. Siga na ordem para entender como os módulos se conectam.

**O caso:** você conheceu a Construtora Álamo em um evento. Ela precisa de um laudo pericial. O trabalho vale R$ 24.000.

---

## 1. Registrar o contato — Prospecção

Vá em **CRM › Prospecção** e clique em **Novo**:

- Nome: *Marina Vaz*
- Empresa: *Construtora Álamo*
- E-mail e telefone dela
- Origem: **Evento**
- Fase: **Prospecção**

Você ligou e ela demonstrou interesse. Edite o prospect e mude a fase para **Contato Realizado**.

## 2. Virar oportunidade — Lead

O interesse se confirmou. Na linha do prospect, clique em **Promover**.

O sistema cria o lead automaticamente. Abra **CRM › Leads**, localize *Marina Vaz* e complete:

- Valor estimado: **24000**
- Estágio: **Qualificado**

Clique em recalcular a pontuação. Com origem *Evento*, valor alto e contato recente, o lead sobe na lista de prioridades.

## 3. Registrar a oportunidade — Negócio

Ainda no lead, avance o estágio conforme a conversa evolui: *Qualificado* → *Proposta*.

Em paralelo, vá a **CRM › Negócios** e crie:

- Título: *Laudo pericial — Construtora Álamo*
- Valor: **24000**
- Pipeline: seu funil de vendas
- Estágio: a etapa correspondente
- Cliente: você ainda não tem o cliente cadastrado

## 4. Transformar em cliente

Volte ao lead, abra o detalhe e clique em **Converter em Cliente**. O sistema cria a Construtora Álamo como cliente e marca o lead como convertido.

Abra o cliente e complete o cadastro: CNPJ, endereço, setor e **tipo de serviço** (*Jurídico*). Na aba **Dados Cadastrais**, ajuste o status para **Em Contato**.

Agora volte ao negócio e selecione o cliente recém-criado.

## 5. Enviar a proposta

Vá em **Operações › Propostas** e clique em **Nova**:

- Título: *Laudo pericial — Construtora Álamo*
- Cliente: **Construtora Álamo**
- Responsável: você
- Válida até: daqui a 15 dias
- Itens: o serviço, somando **R$ 24.000**
- Situação: **Rascunho**

Dados do caso:

- **Advogado Vinculado**: o advogado da construtora, se já estiver em **CRM › Contatos** como tipo *Advogado*; senão, digite o nome em **Nome do Advogado**
- **Perito Responsável**: quem vai assinar o laudo
- **Responsável Técnico**: quem responde tecnicamente pelo trabalho
- **Vincular Projeto**: deixe em branco — o projeto será criado na aprovação

Indicação e rateio:

- **Quem Indicou**: em branco (o contato veio de evento, não de parceiro)
- **Origem da Indicação**: **Evento**
- **Captador**: você, taxa **0,10**
- **Técnico Colaborador**: o perito, taxa **0,20**

Confira o total calculado. Quando estiver pronta, mude a situação para **Enviada**, clique em **Copiar Link Público** e envie o link à Marina. Se preferir anexar, use **Baixar PDF**.

## 6. A proposta é aceita

Marina aprovou. Edite a proposta e mude a situação para **Aceita**.

Neste momento, sem que você faça mais nada, o sistema:

- registra a data de aprovação;
- move o negócio ligado para o último estágio do funil, marcando a venda como **ganha**;
- cria o **projeto** *"Projeto: Laudo pericial — Construtora Álamo"*, com orçamento de R$ 24.000, cliente e responsável já preenchidos, situação *PLANEJAMENTO*.

Confira em **Operações › Projetos**.

## 7. Executar o trabalho

Abra o projeto e complete o que faltar: número CNJ, tipo de perícia, prazo de entrega e gerente.

Crie as **tarefas** da execução em **Operações › Tarefas** — vistoria, análise documental, redação do laudo.

Conforme trabalha, use o **cronômetro** (botão flutuante): escolha o projeto, descreva a atividade, **Iniciar**; ao terminar, **Parar** e **Salvar Tempo**. As horas vão para **Financeiro › Horas** e formam o custo real do projeto.

## 8. Faturar

Com o laudo entregue, vá a **Financeiro › Faturamento** e crie a fatura:

- Cliente: **Construtora Álamo**
- Emissão: hoje
- Vencimento: conforme combinado
- Total: **R$ 24.000**

Baixe o PDF e envie ao cliente.

## 9. Receber e apurar

O pagamento caiu. Em **Financeiro › Transações**, lance:

- Tipo: **Entrada**
- Valor: **R$ 24.000**
- Conta do plano de contas: a receita correspondente
- Conta bancária: onde o dinheiro entrou

Volte à fatura e preencha a **data de pagamento** e o **valor pago**.

Com a entrada registrada, o sistema calcula as comissões conforme o rateio da proposta: R$ 2.400 para o captador (10%) e R$ 4.800 para o técnico (20%). Confira em **Financeiro › Comissões** e, ao pagar, marque como paga.

## 10. Ler o resultado

Abra o **Painel**. O ciclo aparece nos números:

- **Negócios Fechados** subiu
- **Receita Mensal** contabilizou os R$ 24.000
- **Rentabilidade de projetos** compara o orçamento com o custo apurado pelas horas
- O **funil de leads** registra mais uma conversão

Em **Financeiro › Relatórios**, o DRE mostra a receita classificada e o resultado do período.

---

## O caminho em resumo

| Etapa | Onde | O que dispara |
| --- | --- | --- |
| 1. Prospect | CRM › Prospecção | — |
| 2. Promover | botão na linha | cria o lead |
| 3. Negócio | CRM › Negócios | entra no funil |
| 4. Converter | detalhe do lead | cria o cliente |
| 5. Proposta | Operações › Propostas | link público e PDF |
| 6. Aceitar | editar a proposta | ganha o negócio **e** cria o projeto |
| 7. Executar | Projetos, Tarefas, cronômetro | acumula horas e custo |
| 8. Faturar | Financeiro › Faturamento | gera o PDF da fatura |
| 9. Receber | Financeiro › Transações | calcula as comissões |
| 10. Analisar | Painel e Relatórios | fecha o ciclo |
