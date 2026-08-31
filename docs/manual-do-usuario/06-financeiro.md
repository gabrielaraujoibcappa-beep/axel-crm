# 06 — Financeiro

O grupo **Financeiro** cuida do dinheiro que entra, do que sai e do que é devido a cada pessoa.

## Faturamento

As faturas emitidas para os clientes.

**Campos principais:** número da fatura, cliente, contrato (opcional), data de emissão, vencimento, data de pagamento, subtotal, impostos, desconto, total, valor pago, forma de pagamento e observações.

**Baixar PDF.** Cada fatura gera um PDF para enviar ao cliente. Há também um relatório em PDF com o conjunto das faturas.

**Controle de pagamento.** Preencher a data de pagamento e o valor pago é o que permite acompanhar inadimplência. Fatura vencida sem data de pagamento é dinheiro a cobrar.

## Transações

Todo o movimento financeiro, entradas e saídas.

| Tipo | Uso |
| --- | --- |
| **Entrada** | Dinheiro recebido |
| **Saída** | Dinheiro pago |
| **Transferência** | Movimento entre contas próprias |
| **Estorno** | Devolução de um valor |
| **Ajuste** | Correção de lançamento |

Cada transação pode ser classificada em uma conta do plano de contas e associada a uma conta bancária.

**As transações alimentam as comissões.** Quando entra o pagamento de uma venda, o sistema usa esse valor para calcular quanto cabe a cada participante da proposta. Lançar as entradas em dia é o que mantém as comissões corretas.

## Plano de Contas

A estrutura contábil da empresa, em quatro tipos: **Receita**, **Despesa**, **Ativo** e **Passivo**.

As contas são organizadas em hierarquia — uma conta pode ter subcontas. A tela mostra essa árvore. Há também uma opção de importar um plano padrão, útil para começar sem montar tudo do zero.

Classificar as transações nas contas certas é o que dá sentido aos relatórios: sem classificação, o DRE não separa o que é o quê.

## Contas Bancárias

As contas da empresa (banco, agência, número, saldo). Vincular transações à conta correspondente mantém o controle de saldo por banco.

## Horas

Os apontamentos de tempo trabalhado, por projeto e pessoa.

Você pode lançar de duas formas:

- **Pelo cronômetro** — o botão flutuante, descrito no capítulo 02; ele já registra início, fim e descrição
- **Manualmente** — informando o tempo direto no formulário

Se você preencher início e fim sem informar a duração, o sistema calcula os minutos sozinho.

As horas apontadas são a base para medir o custo real dos projetos.

## Comissões

Quanto cada pessoa tem a receber pelas vendas.

Há dois caminhos de apuração:

**1. Automático, a partir da proposta.** Quando entra uma transação referente a uma venda, o sistema distribui a comissão entre os papéis definidos na proposta — captador, vendedor, parceiro e técnico colaborador. O valor de cada um é *valor recebido × percentual do papel*.

Como a base é o **valor efetivamente recebido**, a comissão acompanha o pagamento: se o cliente paga parcelado, a comissão sai proporcionalmente a cada parcela.

**2. Manual ou por regra.** Você pode lançar a comissão direto. Se deixar o valor em branco e existir uma **regra de comissão** aplicável, o sistema calcula pelo percentual da regra sobre o valor do negócio.

**Marcar como paga.** Ao efetuar o pagamento, use a ação correspondente para registrar a baixa.

**Regras de comissão** são configuradas em tela própria e definem os percentuais padrão da empresa.

## Relatórios

| Relatório | O que mostra |
| --- | --- |
| **DRE** | Demonstração do resultado: receitas menos despesas, apurando o lucro do período |
| **DFC** | Demonstração do fluxo de caixa: o dinheiro que entrou e saiu |
| **Fluxo de caixa** | Movimento de caixa no período |
| **Resultado** | Resultado consolidado |

A qualidade desses relatórios depende inteiramente da classificação das transações no plano de contas. Lançamentos sem conta atribuída ficam de fora da apuração.
