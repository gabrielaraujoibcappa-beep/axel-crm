# 09 — Dúvidas frequentes

## Acesso

**O sistema pediu login de novo no meio do dia.**
A sessão vale 24 horas. Depois disso é preciso entrar outra vez. Basta informar e-mail e senha; nada se perde.

**Esqueci minha senha.**
Não há recuperação automática por e-mail. Peça ao administrador da sua empresa que defina uma nova senha em **Admin › Usuários**.

**Meu colega não vê os mesmos dados que eu.**
Cada empresa tem seu próprio espaço. Se a pessoa se cadastrou pela tela de criar conta em vez de ser criada pelo administrador, ela criou uma empresa separada. A solução é o administrador criar o usuário dentro da organização correta.

**Não vejo o menu Admin.**
Ele só aparece para administradores. Peça ao administrador que ajuste seu papel, se for o caso.

## Cadastros

**Cadastrei em duplicidade. Como apago?**
Use a lixeira na linha do registro e confirme. O registro sai das listagens. Nada é apagado definitivamente — em caso de engano, o administrador consegue recuperar.

**O botão Salvar não habilita.**
Algum campo obrigatório (marcado com asterisco) está vazio. Role o formulário e procure os campos destacados.

**Salvei e apareceu erro.**
Os dados continuam na tela. Confira campos com formato específico — e-mail, valores numéricos, datas. Se o erro citar duplicidade, provavelmente já existe um registro com o mesmo identificador único, como o número da fatura.

## Vendas

**Promovi o prospect, mas o botão sumiu.**
É o esperado: cada prospect vira lead uma única vez. Trabalhe daqui em diante pela tela de Leads.

**Converti o lead duas vezes. Criou dois clientes?**
Não. O sistema devolve o cliente que já existe.

**Não consigo mover o negócio de estágio.**
Três motivos possíveis: o negócio já foi **ganho** (não muda mais), já foi **perdido** (precisa ser reaberto antes) ou você está tentando **voltar** o negócio sem informar a justificativa que o sistema exige.

**Movi o negócio e ele foi marcado como ganho sozinho.**
O último estágio do pipeline representa a venda fechada. Ao chegar nele, o negócio é marcado como ganho automaticamente. Se isso não deveria acontecer, revise a ordem dos estágios em **Pipelines**.

**A pontuação do lead não mudou depois que atualizei os dados.**
A nota não se recalcula sozinha. Use o botão de recalcular pontuação.

## Propostas e projetos

**Aceitei a proposta e apareceu um projeto que eu não criei.**
É o comportamento esperado: proposta aceita gera o projeto automaticamente, com o orçamento igual ao total da proposta. Ajuste os dados do projeto conforme necessário.

**Aceitei a proposta e o negócio foi fechado sozinho.**
Também é esperado, quando há um negócio ligado à proposta. A aprovação comercial fecha a venda.

**"Converter em Projeto" não funciona.**
Dois motivos possíveis: a proposta não está com a situação **Aceita**, ou ela já tem um projeto vinculado. O sistema avisa qual é o caso.

**Aceitei a proposta e o projeto não foi criado.**
Verifique o campo **Vincular Projeto** na proposta. Se houver um projeto ali, o sistema entende que o trabalho já tem destino e não cria outro.

**O advogado que digitei sumiu do campo de nome.**
Se você também selecionou um **Advogado Vinculado** na lista de contatos, o nome passa a vir do contato e o campo de texto livre é limpo. Use o texto livre apenas quando o advogado ainda não está cadastrado.

**O advogado não aparece na lista para selecionar.**
A lista traz apenas contatos cadastrados com o tipo **Advogado**. Cadastre-o em **CRM › Contatos** com esse tipo e reabra o formulário.

**O perito responsável não recebeu comissão.**
Perito Responsável e Responsável Técnico são campos de registro — eles não entram no rateio. Quem recebe comissão são Parceiro/Indicador, Captador, Vendedor e Técnico Colaborador, cada um com sua taxa.

**Salvei a proposta aceita de novo. Vai duplicar o projeto?**
Não. O sistema verifica se já existe projeto originado daquela proposta.

**O total da proposta não bate.**
O total é a soma dos itens menos o desconto — ele não é digitado. Revise os itens e o valor do desconto.

## Financeiro

**As comissões não apareceram.**
A comissão automática é calculada quando você lança a **transação de entrada** referente à venda. Sem o lançamento, não há apuração. Verifique também se os papéis e as taxas foram preenchidos na proposta.

**A comissão saiu com valor errado.**
As taxas são informadas em decimal: 0,10 é 10%. Digitar "10" significa 1.000%. Revise a proposta.

**O DRE está com números estranhos.**
Os relatórios usam a classificação das transações no plano de contas. Transações sem conta atribuída ficam de fora. Revise os lançamentos do período.

**As horas do cronômetro não apareceram.**
Depois de parar o cronômetro é preciso clicar em **Salvar Tempo**. Sem isso, o tempo é descartado.

**O cronômetro não inicia.**
É necessário escolher um projeto antes — o botão fica bloqueado até lá.

## Recursos ainda não disponíveis

**Enviei a campanha e ninguém recebeu.**
O envio hoje é uma simulação: o sistema registra a lista de destinatários, mas não dispara mensagens. Não há provedor de e-mail ou WhatsApp conectado. Faça o disparo por fora até a integração ser habilitada.

**Conectei o Google, mas minha agenda não aparece.**
A tela de integração com o Google ainda exibe dados de demonstração. A conexão real não está habilitada.

**A geração de texto por IA devolve sempre a mesma coisa.**
Esse recurso também está em modo demonstração.

## Aparência e navegação

**Como troco entre tema claro e escuro?**
Pelo ícone de sol/lua na barra superior. A escolha fica salva no seu navegador.

**Quero mais espaço na tela.**
Recolha o menu lateral pelo botão ☰.

**Como revejo o tutorial inicial?**
Clique no seu avatar e escolha **Ver tutorial**.

**A tabela mostra poucos registros.**
Ajuste a quantidade por página no rodapé da tabela e navegue entre as páginas.

## Quando pedir ajuda

Procure o administrador da sua empresa quando precisar de: nova senha, criação ou desativação de usuário, mudança de papel, ajuste no pipeline ou no plano de contas, ou recuperação de um registro excluído.
