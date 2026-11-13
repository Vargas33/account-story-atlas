export const REFERENCE_DATE = "13/11/2026";
export type Account = {
  id: string;
  name: string;
  type: "Corrente" | "Poupança" | "Cartão de crédito";
  currency: "USD";
  current: number;
  available: number | null;
  limit: number | null;
};
export type Transaction = {
  id: string;
  date: string;
  name: string;
  amount: number;
  accountId: string;
  category: string;
  pending: boolean;
  consumption: boolean;
};
export const accounts: Account[] = [
  {
    id: "checking",
    name: "Plaid Checking",
    type: "Corrente",
    currency: "USD",
    current: 110,
    available: 100,
    limit: null,
  },
  {
    id: "saving",
    name: "Plaid Saving",
    type: "Poupança",
    currency: "USD",
    current: 210,
    available: 200,
    limit: null,
  },
  {
    id: "credit",
    name: "Plaid Credit Card",
    type: "Cartão de crédito",
    currency: "USD",
    current: 410,
    available: null,
    limit: 2000,
  },
  {
    id: "business",
    name: "Plaid Business Credit Card",
    type: "Cartão de crédito",
    currency: "USD",
    current: 5020,
    available: 4980,
    limit: 10000,
  },
];
// Extra rows are authored educational examples, not a live Plaid response.
export const transactions: Transaction[] = [
  {
    id: "t1",
    date: "2026-11-10",
    name: "Uber (SF POOL)",
    amount: 5.4,
    accountId: "checking",
    category: "Transporte",
    pending: false,
    consumption: true,
  },
  {
    id: "t2",
    date: "2026-11-10",
    name: "Pagamento de cartão",
    amount: 25,
    accountId: "saving",
    category: "Pagamento de dívida",
    pending: false,
    consumption: false,
  },
  {
    id: "t3",
    date: "2026-11-08",
    name: "Touchstone Climbing",
    amount: 78.5,
    accountId: "credit",
    category: "Lazer",
    pending: false,
    consumption: true,
  },
  {
    id: "t4",
    date: "2026-11-06",
    name: "Trem regional (exemplo)",
    amount: 18,
    accountId: "checking",
    category: "Transporte",
    pending: false,
    consumption: true,
  },
  {
    id: "t5",
    date: "2026-11-03",
    name: "Hospedagem (exemplo)",
    amount: 120,
    accountId: "credit",
    category: "Viagens",
    pending: false,
    consumption: true,
  },
  {
    id: "t6",
    date: "2026-10-28",
    name: "Ônibus aeroporto (exemplo)",
    amount: 12,
    accountId: "checking",
    category: "Transporte",
    pending: false,
    consumption: true,
  },
];
export function money(value: number | null | undefined) {
  return value == null
    ? "Não informado"
    : `US$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function displayDate(date: string) {
  return date.split("-").reverse().join("/");
}
export type Currency = "USD" | "BRL";
// Fixed fictitious demo rate, always declared on screen; never a live quote.
export const DEMO_USD_BRL_RATE = 5;
export function moneyBrl(value: number | null | undefined) {
  return value == null
    ? "Não informado"
    : `R$ ${(value * DEMO_USD_BRL_RATE).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function moneyIn(value: number | null | undefined, currency: Currency = "USD") {
  if (value == null) return "Não informado";
  return currency === "BRL" ? `${moneyBrl(value)} · ${money(value)}` : money(value);
}
export function accountTotals(rows: Account[]) {
  return {
    available: rows
      .filter((a) => a.type !== "Cartão de crédito")
      .reduce((n, a) => n + (a.available ?? 0), 0),
    debt: rows.filter((a) => a.type === "Cartão de crédito").reduce((n, a) => n + a.current, 0),
    limit: rows
      .filter((a) => a.type === "Cartão de crédito")
      .reduce((n, a) => n + (a.limit ?? 0), 0),
  };
}
export function summarize(rows: Transaction[]) {
  const confirmed = rows.filter((t) => !t.pending);
  return {
    outflow: confirmed.filter((t) => t.amount > 0).reduce((n, t) => n + t.amount, 0),
    inflow: confirmed.filter((t) => t.amount < 0).reduce((n, t) => n - t.amount, 0),
    pendingOutflow: rows.filter((t) => t.pending && t.amount > 0).reduce((n, t) => n + t.amount, 0),
    consumption: confirmed
      .filter((t) => t.consumption && t.amount > 0)
      .reduce((n, t) => n + t.amount, 0),
    categories: [...new Set(confirmed.map((t) => t.category))].map((category) => ({
      category,
      total: confirmed
        .filter((t) => t.category === category && t.amount > 0)
        .reduce((n, t) => n + t.amount, 0),
    })),
  };
}
export type Filters = { accountId?: string; start?: string; end?: string };
export interface FinanceService {
  getAccounts(): Promise<Account[]>;
  getTransactions(filters?: Filters): Promise<Transaction[]>;
}
export const demoFinanceService: FinanceService = {
  async getAccounts() {
    return accounts;
  },
  async getTransactions(filters = {}) {
    return transactions
      .filter(
        (t) =>
          (!filters.accountId || t.accountId === filters.accountId) &&
          (!filters.start || t.date >= filters.start) &&
          (!filters.end || t.date <= filters.end),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  },
};
export type Answer = {
  text: string;
  kind?: "accounts" | "balances" | "transactions" | "summary" | "travel";
  accounts?: Account[];
  transactions?: Transaction[];
  period?: string;
  count?: number;
};
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export async function answerQuestion(
  question: string,
  filters: Filters = {},
  service: FinanceService = demoFinanceService,
): Promise<Answer> {
  const q = normalize(question);
  if (
    /passage|reserva|invest|recomend|transferir|pagar|contratar|cotacao|real time|tempo real|converter|reais/.test(
      q,
    )
  )
    return {
      text: "Não consulto preços de passagens, não faço operações bancárias, conversões de moeda ou recomendações financeiras. Nesta demonstração, posso mostrar suas contas, saldos e movimentações da amostra fictícia em USD. Quer consultar seus saldos?",
    };
  if (/saldo|disponivel|divida|limite|orcamento|cabe|posso viajar/.test(q)) {
    const rows = await service.getAccounts();
    return {
      text: `Na amostra, o dinheiro disponível em conta corrente e poupança soma **${money(accountTotals(rows).available)}**. Dívidas e limites de cartão estão separados abaixo; não são dinheiro em conta. Estes dados não permitem concluir se uma viagem cabe no orçamento.`,
      kind: "balances",
      accounts: rows,
      period: REFERENCE_DATE,
      count: rows.length,
    };
  }
  if (/contas/.test(q) && !/transac|movimenta|gasto/.test(q)) {
    const rows = await service.getAccounts();
    return {
      text: `Estas são as **${rows.length} contas fictícias** da nossa amostra local. Todas estão em USD, sem conversão para reais.`,
      kind: "accounts",
      accounts: rows,
      period: REFERENCE_DATE,
      count: rows.length,
    };
  }
  if (/transac|movimenta|transporte|viage|gast|resum|entrada|saida/.test(q)) {
    const account =
      accounts.find((a) => q.includes(normalize(a.name))) ??
      (/checking|corrente/.test(q)
        ? accounts[0]
        : /saving|poupanca/.test(q)
          ? accounts[1]
          : undefined);
    const dates = [...q.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)].map(
      (m) => `${m[3]}-${m[2]}-${m[1]}`,
    );
    const resolved = {
      ...filters,
      ...(account ? { accountId: account.id } : {}),
      ...(dates.length ? { start: dates[0], end: dates[1] ?? dates[0] } : {}),
    };
    let rows = await service.getTransactions(resolved);
    if (/transporte|viage|gast/.test(q) && !/resum/.test(q))
      rows = rows.filter((t) => ["Transporte", "Viagens"].includes(t.category));
    if (/ultim|recent|cinco|5 /.test(q)) rows = rows.slice(0, 5);
    const period =
      resolved.start || resolved.end
        ? `${resolved.start ? displayDate(resolved.start) : "28/10/2026"} a ${resolved.end ? displayDate(resolved.end) : REFERENCE_DATE}`
        : rows.length
          ? `${displayDate(rows.at(-1)?.date ?? "2026-10-28")} a ${displayDate(rows[0]?.date ?? "2026-11-13")}`
          : `28/10/2026 a ${REFERENCE_DATE}`;
    if (!rows.length)
      return {
        text: "Não há transações na amostra para esse período ou conta. Você pode escolher outra conta ou ampliar o período.",
        kind: "transactions",
        transactions: [],
        period,
        count: 0,
      };
    const travel = /transporte|viage|gast/.test(q) && !/resum/.test(q);
    const summary = /resum|categoria|movimenta/.test(q);
    return {
      text: travel
        ? `As saídas confirmadas com transporte e viagens somam **${money(summarize(rows).outflow)}**, em **${rows.length} registros**. Esta é uma amostra pequena e fictícia, não o seu histórico bancário completo.`
        : summary
          ? "Aqui está o resumo das movimentações disponíveis. Pagamentos de dívida são mostrados separadamente do consumo; valores pendentes não entram nos totais confirmados."
          : "Estas são as movimentações encontradas na amostra, da mais recente para a mais antiga. Valores positivos na Plaid são saídas; negativos são entradas.",
      kind: travel ? "travel" : summary ? "summary" : "transactions",
      transactions: rows,
      period,
      count: rows.length,
    };
  }
  return {
    text: "Só posso responder com base nas 4 contas e 6 transações fictícias desta demonstração. Não tenho dados suficientes para responder a essa pergunta. Posso mostrar suas contas, consultar saldos ou resumir as movimentações por categoria.",
  };
}
