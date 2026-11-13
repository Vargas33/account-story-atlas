# MBV Viagens · Assistente Barreto

Chat de demonstração em que o assistente **Barreto**, dentro do app de uma agência de viagem (**MBV**), ajuda o cliente a entender contas, saldos e gastos na hora de decidir se uma viagem cabe no orçamento.

> **Demonstração educacional. Todos os dados são fictícios** e vêm da Plaid Sandbox. O app publicado funciona com uma amostra local e **não está conectado a nenhuma API**.

App publicado: https://account-story-atlas.lovable.app

## 1. Onde está o cliente e de onde vem cada dado

- **Onde o cliente está:** no app da agência de viagem MBV, na hora de planejar uma viagem.
- **O que o assistente responde ali:** contas e tipos, saldo atual e disponível, separação entre dinheiro disponível, dívidas e limites, últimas transações e resumo por categoria. Perguntas sem suporte (por exemplo, preço de passagens) recebem uma explicação da limitação, sem inventar números.
- **De onde vem cada dado:**
  - **Documentação da Pluggy:** consultada via MCP, para entender Item, conta, transação, o endpoint `GET /v2/transactions` e a paginação por cursor.
  - **Dados bancários fictícios:** vêm da **Plaid Sandbox**. Na consulta de teste foram obtidas 14 contas e 16 transações (16/08/2026 a 13/11/2026), em USD, no First Platypus Bank (`ins_109508`).
  - **No app publicado (Etapa 1):** uma amostra local pequena, com 4 contas e 6 transações fictícias, claramente identificada como demonstração. A integração com backend ainda não foi ativada.

## 2. Como configurar os servidores MCP

### Pluggy (MCP remoto, sem chave)

No aplicativo: **Personalizar > Plugins > Adicionar > Adicionar servidor MCP personalizado**.

| Campo | Valor |
|---|---|
| Nome | pluggy |
| URL do servidor | `https://mcp.pluggy.ai/mcp` |
| Autenticação | Sem autenticação |

Depois de criar, escolha **Usar sem uma conta** e chame `@pluggy` no chat. Os prints em `prints/` mostram a consulta aos endpoints, os conceitos e a paginação.

### Plaid (limitação encontrada)

O guia usa o servidor MCP local da Plaid (`mcp-server-plaid`, executado com `uvx`, tipo STDIO). O aplicativo usado neste projeto (ChatGPT para desktop) **só aceita servidores MCP remotos**, então não foi possível cadastrar o servidor local.

Alternativa adotada: consultar a **API Sandbox da Plaid diretamente**, com um script em Python (`scripts/plaid_sandbox.py`) que:

1. cria um Item de Sandbox com o produto `transactions`;
2. consulta `/accounts/get` e `/transactions/get` (últimos 90 dias, todas as páginas);
3. usa exclusivamente `https://sandbox.plaid.com`.

As credenciais ficam em um arquivo `.env` local, ignorado pelo Git. Nenhuma chave, token ou senha foi versionada ou aparece nos prints. Veja `.env.example` para os nomes das variáveis (`PLAID_CLIENT_ID` e `PLAID_SECRET`).

## 3. Especificação enviada ao Lovable e ajustes

- O prompt completo enviado ao Lovable está em `docs/prompt-lovable.md`. Ele foi adaptado do guia do desafio para o cenário de agência de viagem.
- Resumo: app focado em conversa, em português brasileiro, com selo "Demonstração · Dados fictícios", sugestões clicáveis, histórico local, valores preservados em USD, regras de sinal da Plaid (positivo é saída), campos ausentes como "Não informado" e nenhuma operação bancária de escrita.
- A primeira entrega foi pedida em **modo demonstrativo** (Etapa 1), com a preparação, e não a ativação, de backend e Plaid (Etapa 2). Segredos só no backend.
- **Ajustes depois da primeira versão: O histórico de conversa e visual das cores.

## 4. Melhoria escolhida

[PREENCHER depois de implementar: valores também em reais, com a conversão declarada (taxa fixa de demonstração, USD original sempre visível, sem cotação em tempo real).]

Endereço do app publicado: https://account-story-atlas.lovable.app

## Estrutura do repositório

| Caminho | Conteúdo |
|---|---|
| `src/` e demais arquivos | Código do app gerado pelo Lovable |
| `scripts/plaid_sandbox.py` | Script de consulta à Plaid Sandbox (sem segredos) |
| `docs/prompt-lovable.md` | Prompt enviado ao Lovable |
| `prints/` | Evidências: Pluggy (endpoints, conceitos, paginação), Plaid (contas, transações) e o app |
| `.env.example` | Nomes das variáveis de ambiente, sem valores |

## Segurança

- Nenhuma credencial no repositório. `.env` e o arquivo do token estão no `.gitignore`.
- Dados fictícios (Plaid Sandbox). Em produção, o Open Finance exige consentimento, segurança, credenciais próprias e as regras do país onde a solução opera. A Plaid não representa o Open Finance brasileiro.
