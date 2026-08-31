# 05 — Operações

Depois que a venda avança, o trabalho passa para o grupo **Operações**.

## Propostas

A proposta comercial que vai ao cliente.

**Cadastrar.** Informe título, **cliente**, responsável, validade, descrição e desconto. Os itens da proposta compõem o valor; o total é calculado como **soma dos itens menos o desconto** — você não digita o total.

### Dados do caso

Além do comercial, a proposta registra quem é quem no trabalho:

| Campo | Como preencher |
| --- | --- |
| **Advogado Vinculado** | Selecione entre os contatos cadastrados com o tipo *Advogado*. Cadastre-o antes em **CRM › Contatos** para tê-lo na lista. |
| **Nome do Advogado** | Use só quando o advogado ainda não está cadastrado. Se você escolher um advogado na lista acima, este campo é ignorado e o nome passa a vir do contato. |
| **Perito Responsável** | O usuário do sistema responsável pela perícia. |
| **Responsável Técnico** | O usuário responsável tecnicamente pelo trabalho. |
| **Vincular Projeto** | Liga a proposta a um projeto que já existe. |

Perito e responsável técnico são registro de responsabilidade: eles **não** entram no cálculo de comissão. Quem participa do rateio são os quatro papéis descritos adiante.

**Sobre vincular projeto.** Se você vincular um projeto manualmente, a proposta deixa de gerar projeto novo quando for aceita — o sistema entende que o trabalho já tem destino. Deixe em branco quando quiser que o projeto seja criado automaticamente na aprovação.

**Situações da proposta:**

| Situação | Significado |
| --- | --- |
| **Rascunho** | Em elaboração, ainda não enviada |
| **Enviada** | Já foi para o cliente |
| **Visualizada** | O cliente abriu |
| **Negociando** | Em ajuste de condições |
| **Aceita** | Aprovada — dispara as ações automáticas |
| **Rejeitada** | Recusada |
| **Expirada** | Passou da validade |

### Indicação e rateio de comissão

| Campo | Quem é |
| --- | --- |
| **Quem Indicou (Parceiro/Indicador)** + taxa | Quem trouxe a indicação — escolhido entre os parceiros cadastrados |
| **Origem da Indicação** | Por onde veio: Site, Redes Sociais, Indicação, E-mail, Telefone, Evento, Anúncio, Parceiro ou Outro |
| **Captador** + taxa | Quem trouxe a oportunidade |
| **Vendedor** + taxa | Quem conduziu a venda |
| **Técnico Colaborador** + taxa | Quem executa o trabalho |

As taxas são informadas em decimal: **0,10 significa 10%**. Preencha apenas os papéis que se aplicam — os demais podem ficar em branco.

**Enviar ao cliente.** Use o botão **Copiar Link Público** na linha da proposta e envie o link por e-mail ou WhatsApp. O cliente abre a proposta no navegador, sem precisar de senha, e pode baixar o PDF.

> O link é permanente e não expira. Quem tiver o endereço consegue ver a proposta, mesmo depois de expirada ou rejeitada. Envie apenas para o destinatário certo.

**Baixar PDF.** O botão de PDF gera o documento formatado para anexar em e-mail ou imprimir.

### O que acontece quando a proposta é aceita

Ao mudar a situação para **Aceita**, o sistema faz três coisas sozinho:

1. Registra a data de aprovação.
2. Se houver um negócio ligado à proposta, move esse negócio para o **último estágio do pipeline** — ou seja, marca a venda como ganha, com a justificativa *"Aprovação automática via Proposta comercial"*.
3. Cria o **projeto** correspondente, com:
   - nome *"Projeto: (título da proposta)"*
   - cliente e responsável herdados da proposta
   - início hoje e término previsto para daqui a três meses
   - orçamento igual ao total da proposta
   - situação *PLANEJAMENTO*

O projeto criado passa a ser o **projeto vinculado** da proposta. Salvar a proposta como aceita mais de uma vez **não** duplica o projeto. E se você já tinha vinculado um projeto manualmente, nenhum projeto novo é criado.

Se preferir criar o projeto manualmente depois, use **Converter em Projeto**. A ação exige que a proposta esteja aceita e que ela ainda não tenha projeto vinculado — caso contrário o sistema avisa na tela.

## Projetos

O trabalho contratado, em execução.

**Campos principais:** nome, descrição, cliente, gerente responsável, início, término, orçamento e custo. Para trabalhos periciais e jurídicos há ainda número CNJ, tipo de perícia, situação de pagamento e prazo de entrega.

**Orçamento × custo.** O orçamento vem da proposta; o custo é o que você lança conforme o trabalho consome recursos. A diferença entre os dois é a rentabilidade que aparece no painel.

O projeto é também o destino das **horas apontadas** pelo cronômetro.

## Contratos

Os contratos firmados com os clientes: identificação, vigência, valor e situação. As faturas podem ser vinculadas a um contrato, o que permite acompanhar o faturamento de cada acordo.

## Processos

Processos jurídicos, identificados pelo número CNJ. Há uma busca própria para localizar pelo número. Um projeto pode ser vinculado a um processo — útil para trabalhos periciais.

## Tarefas

O que precisa ser feito, por quem e até quando.

**Situações:** Pendente, Em Andamento, Bloqueada, Concluída, Cancelada.

Tarefas podem ser criadas soltas ou a partir da tela de um lead ou cliente, ficando vinculadas a ele. As tarefas recentes aparecem no painel.

## Produtos

O catálogo do que você vende — produtos ou serviços, com descrição e preço. Serve de base para montar os itens das propostas sem redigitar.

## Campanhas

Ações de marketing para a base: e-mail, redes sociais, mídia paga, SEO, evento, webinar, mala direta ou outro.

**Cadastrar** a campanha e, quando estiver pronta, usar a ação de **enviar**. O sistema monta a lista de destinatários com **todos** os leads e clientes da organização que tenham e-mail ou telefone, e marca a campanha como enviada. Uma campanha enviada não pode ser reenviada.

> **Importante:** o envio hoje é uma simulação. O sistema registra quem seriam os destinatários, mas **nenhuma mensagem é efetivamente disparada** — não há provedor de e-mail ou WhatsApp conectado. Use o recurso para planejar a lista; o disparo precisa ser feito por fora até a integração ser habilitada.

Note ainda que não há segmentação: a lista inclui a base inteira, não um recorte.

## Tickets

Chamados de suporte dos clientes, para registrar e acompanhar solicitações até a solução.

## Documentos

Repositório de documentos da organização. Para arquivos ligados a um cliente específico, prefira a aba **Arquivos & Anexos** dentro do próprio cliente — fica mais fácil de achar depois.
