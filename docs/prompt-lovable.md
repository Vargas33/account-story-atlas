# Prompt enviado ao Lovable

Prompt único, adaptado das páginas 25 a 28 do guia do desafio para o cenário de agência de viagem (MBV Viagens, assistente Barreto). Foi enviado primeiro no modo chat e depois no modo Construir.

## Prompt inicial

```
Crie uma aplicação web chamada MBV Viagens, com um chat para consultar contas, saldos e transações e entender gastos em linguagem simples, no contexto de quem planeja uma viagem. Será uma demonstração educacional de IA, MCP e APIs financeiras. Todos os registros bancários são fictícios, provenientes da Plaid Sandbox.

CONTEXTO
O cliente já está na agência de viagem: o assistente aparece dentro do app da MBV, na hora de decidir se cabe uma viagem no orçamento. A MBV é só a marca da interface; os dados de origem continuam identificados como Plaid Sandbox. Na etapa anterior do projeto, a documentação da Pluggy foi consultada via MCP e a Plaid foi consultada por API direta, com 14 contas e 16 transações entre 16/08/2026 e 13/11/2026. A aplicação web NÃO estará conectada automaticamente a esses serviços: o frontend precisará de um backend próprio para a integração.

IDENTIDADE E EXPERIÊNCIA
Nome do app: MBV Viagens. Assistente: Barreto. Idioma: português brasileiro. Estilo de agência de viagem moderna e acolhedora, com azul-petróleo, branco e areia claro. Monograma "M", boa legibilidade, espaçamento confortável, layout responsivo.
Foco em conversa, não em landing page. Manter sempre visível a indicação "Demonstração · Dados fictícios". Deve funcionar em desktop e celular.

SAUDAÇÃO INICIAL
"Olá! Sou o Barreto, assistente da MBV. Quer ver se a sua próxima viagem cabe no orçamento?"

Sugestões clicáveis: Mostrar minhas contas; Consultar meus saldos; Ver minhas últimas transações; Quanto gastei com transporte e viagens?; Resumir minhas movimentações.

O chat deve ter campo de mensagem fixo, botão de envio, carregamento, erros compreensíveis e histórico. Enter envia; Shift+Enter quebra a linha. As sugestões devem enviar pedidos de verdade. As respostas podem incluir cartões, tabelas e gráficos simples dentro da conversa, legíveis no celular.

FUNCIONALIDADES
1. Listar contas, tipos e moedas.
2. Mostrar saldo atual e disponível por conta.
3. Separar dinheiro disponível, dívidas e limites de crédito.
4. Listar transações por período e conta.
5. Mostrar as cinco transações mais recentes.
6. Resumir movimentações por categoria.
7. Responder apenas com base nos dados disponíveis.
8. Iniciar nova conversa e consultar o histórico.
Não incluir pagamentos, transferências, reservas pagas, contratação de crédito nem qualquer operação bancária de escrita.

REGRAS DOS DADOS E DAS RESPOSTAS
Preservar USD quando essa for a moeda recebida, no formato "US$ 110,00". Não converter para reais sem conversão explicitamente implementada. Saldo devedor não é dinheiro disponível. Exibir campos ausentes como "Não informado".
Na Plaid, valores positivos de transação são saídas e negativos são entradas. Separar transações pendentes das confirmadas nos totais. Não tratar toda transferência como consumo. Informar sempre período e quantidade de registros analisados.
Não inventar transações, categorias, recorrências ou conclusões. Datas e descrições devem vir dos registros. Não simular atualização em tempo real. Perguntas sem suporte (por exemplo, preço de passagens) devem receber uma explicação da limitação e sugestões válidas. O Barreto não dá recomendação financeira nem de investimento.

ETAPA 1: FRONTEND DEMONSTRÁVEL
Entregar primeiro uma interface funcional com dados locais fictícios, sem pedir credenciais. Identificar o modo de demonstração e a data de referência (13/11/2026). Usar esta amostra pequena e coerente, com todos os cálculos feitos sobre ela:

Contas:
- Plaid Checking: saldo US$ 110,00; disponível US$ 100,00
- Plaid Saving: saldo US$ 210,00; disponível US$ 200,00
- Plaid Credit Card: dívida US$ 410,00; disponível "Não informado"; limite US$ 2.000,00
- Plaid Business Credit Card: dívida US$ 5.020,00; disponível US$ 4.980,00; limite US$ 10.000,00

Transações recentes (todas confirmadas):
- 10/11/2026, Uber (SF POOL), US$ 5,40, Plaid Checking, transporte
- 10/11/2026, Pagamento de cartão, US$ 25,00, Plaid Saving, pagamento de dívida
- 08/11/2026, Touchstone Climbing, US$ 78,50, Plaid Credit Card, lazer
Adicionar algumas transações coerentes de transporte e viagem para a pergunta "Quanto gastei com transporte e viagens?", deixando claro que a amostra é pequena e fictícia.
Não apresentar a base de exemplo como sendo as 14 contas e 16 transações reais da consulta. Se houver respostas simuladas, deixar isso claro na interface.

ETAPA 2: BACKEND E INTEGRAÇÃO (apenas preparar, não ativar)
Separar os dados locais por uma camada de serviços substituível. Fluxo futuro: usuário pergunta, backend interpreta a intenção, consulta a Plaid, calcula, o assistente explica, o frontend apresenta. Endpoints futuros: POST /accounts/get e POST /transactions/get em https://sandbox.plaid.com, único ambiente permitido. Tratar PRODUCT_NOT_READY, autenticação inválida e indisponibilidade com mensagens claras e tentativas limitadas.
Segredos apenas no backend (nomes previstos, não valores): PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN. Nunca usar variáveis públicas, armazenamento do navegador nem mensagens do chat para guardar credenciais. Não solicitar credenciais neste prompt. Não implementar webhook nesta versão.

CRITÉRIO DE HONESTIDADE
A primeira entrega funciona em modo demonstrativo. A interface nunca deve indicar "Conectado" a uma API que não foi integrada.

CRITÉRIOS DE ACEITE
Marca e chat como foco; desktop e celular utilizáveis; envio por botão e Enter; sugestões clicáveis e mensagens vazias impedidas; contas, saldos e transações claros; totais coerentes com os dados usados; perguntas sem resposta tratadas sem inventar números; carregamento, erro e conjunto vazio previstos; nova conversa e histórico funcionando; modo local diferente de integração ativa; nenhuma credencial exposta ao navegador; nenhuma operação bancária de escrita.

INSTRUÇÃO FINAL
Comece pela Etapa 1. Ao entregar a prévia, explique objetivamente o que já funciona e o que falta para ativar a Etapa 2. Não publique automaticamente.
```

## Ajustes depois da primeira versão

1. Histórico de conversas: verificado na prévia; se necessário, foi pedida a correção para que a conversa anterior apareça em "Conversas recentes".
2. Melhoria (valores em reais), pedida depois da publicação:

```
Adicione um seletor USD/BRL. Em BRL, mostre os valores convertidos com uma taxa fixa declarada na tela (por exemplo, "Taxa de demonstração: 1 USD = R$ 5,00, fixa e fictícia"), mantendo o USD original visível. Não simule cotação em tempo real.
```
