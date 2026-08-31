# 07 — Administração

O grupo **Admin** só aparece para quem tem perfil de administrador.

## Usuários

Onde você cria e gerencia as contas da equipe.

**Criar um usuário.** Informe nome, e-mail, senha inicial e o **papel**. Oriente a pessoa a trocar a senha no primeiro acesso, pelo **Perfil**.

**Papéis disponíveis:**

| Papel | Perfil de uso |
| --- | --- |
| **SUPER_ADMIN** | Administração total |
| **ADMIN** | Administrador da empresa |
| **MANAGER** | Gestão de equipe |
| **SALES** | Comercial |
| **SUPPORT** | Atendimento |
| **USER** | Uso geral |
| **VIEWER** | Consulta |

Apenas **ADMIN** e **SUPER_ADMIN** enxergam as telas de **Usuários** e **Integrações**.

> **Atenção — limitação importante.** Hoje o papel controla o que aparece no menu, mas o sistema ainda não restringe as operações por trás das telas. Na prática, qualquer pessoa com acesso ao sistema consegue chegar às funções administrativas se souber o caminho. Enquanto isso não for corrigido, **conceda acesso apenas a quem é de confiança** e trate todos os usuários como se tivessem permissão ampla. A equipe técnica tem esse ponto registrado como prioridade.

**Desativar um usuário.** Prefira desativar a excluir quando alguém sai da empresa: o histórico de ações da pessoa continua íntegro, e ela deixa de conseguir entrar.

## Integrações

Tela de configuração de serviços externos.

**O que já funciona:** o cadastro das integrações — você registra quais serviços a empresa usa e seus dados de configuração.

**O que ainda não funciona:** a conexão com o Google (agenda, contatos e e-mail) e a geração de texto por inteligência artificial aparecem na tela, mas **respondem com dados de demonstração**. Conectar ou desconectar nessa tela não estabelece ligação real com sua conta Google, e a agenda exibida não é a sua.

Não tome decisão baseada no que essas telas mostram até que a integração seja efetivamente habilitada. Do mesmo modo, o envio de campanhas (capítulo 05) ainda não dispara mensagens.

## Boas práticas para o administrador

**Monte o pipeline antes de liberar o time.** Os estágios do funil e o plano de contas definem como todo o resto será registrado. Mudar depois, com dados dentro, dá muito mais trabalho.

**Padronize a origem dos leads.** A pontuação dos leads depende da origem informada. Se cada pessoa preencher de um jeito, o indicador perde valor.

**Combine o significado dos estágios.** "Qualificado" precisa querer dizer a mesma coisa para todo mundo, senão o funil não mede nada.

**Revise as taxas de comissão nas propostas.** Elas são digitadas em decimal (0,10 = 10%). Um erro aqui vira pagamento errado depois.

**Acompanhe os lançamentos financeiros.** Comissões e relatórios saem do que está registrado em Transações. Atraso no lançamento vira erro no relatório.
