# Integração futura — não ativada

Esta versão executa apenas respostas locais simuladas. Não existe conexão com APIs ou IA, nem uso de segredos. A amostra tem 4 contas e 6 transações fictícias, não representa a consulta anterior de 14 contas e 16 transações.

## Camada substituível

`FinanceService` define `getAccounts()` e `getTransactions(filters)`. `demoFinanceService` é o único adaptador ativo. A interface apresenta resultados estruturados e os cálculos são funções puras testadas.

## Fluxo a implementar na etapa 2

Pergunta e histórico completo → backend interpreta intenção → leitura na Plaid Sandbox → normalização e cálculos → assistente explica → resposta estruturada no chat. Ativar Lovable Cloud somente nessa etapa. Autenticar o usuário e vincular sua conta antes das consultas reais; nunca confiar em um token financeiro enviado no chat.

Único host permitido: `https://sandbox.plaid.com`. Chamadas de leitura previstas: `POST /accounts/get` e `POST /transactions/get`. Paginação de transações é necessária antes de calcular um período completo. Moeda, campos ausentes, sinal de valores, pendências, transferências e dívidas devem manter as regras dos testes. Não implementar operações bancárias de escrita ou webhooks.

Nomes de segredos futuros, sem valores: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ACCESS_TOKEN`. Somente no backend, nunca `VITE_*`, navegador ou histórico de chat.

## Erros previstos

- `PRODUCT_NOT_READY`: “Os dados ainda estão sendo preparados. Tente novamente mais tarde.” Limitar a duas novas tentativas com espera progressiva; nunca loop infinito.
- Autenticação inválida: “Não foi possível validar o acesso aos dados.” Não repetir automaticamente; correção somente no backend.
- Indisponibilidade: “O serviço de dados está indisponível no momento.” Até duas novas tentativas com espera progressiva para falhas transitórias; manter histórico e permitir nova ação explícita.

Só mostrar integração ativa após uma chamada autenticada bem-sucedida. Manter origem, data real de referência e modo de demonstração distintos.