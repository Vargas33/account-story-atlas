import { describe, expect, it } from "vitest";
import {
  accounts,
  accountTotals,
  answerQuestion,
  DEMO_USD_BRL_RATE,
  demoFinanceService,
  money,
  moneyBrl,
  moneyIn,
  summarize,
  transactions,
} from "@/lib/demo-finance";
describe("Regras financeiras da demonstração", () => {
  it("preserva USD e informa valores ausentes", () => {
    expect(money(110)).toBe("US$ 110,00");
    expect(money(null)).toBe("Não informado");
  });
  it("preserva os saldos fornecidos", () => {
    expect(accounts.map((a) => [a.current, a.available, a.limit])).toEqual([
      [110, 100, null],
      [210, 200, null],
      [410, null, 2000],
      [5020, 4980, 10000],
    ]);
  });
  it("não soma dívida ou crédito ao dinheiro disponível", () => {
    expect(accountTotals(accounts)).toEqual({ available: 300, debt: 5430, limit: 12000 });
  });
  it("preserva as três transações fornecidas", () => {
    expect(transactions.slice(0, 3).map((t) => [t.date, t.name, t.amount])).toEqual([
      ["2026-11-10", "Uber (SF POOL)", 5.4],
      ["2026-11-10", "Pagamento de cartão", 25],
      ["2026-11-08", "Touchstone Climbing", 78.5],
    ]);
  });
  it("separa entradas, pendências e pagamentos de dívida do consumo", () => {
    const first = transactions[0];
    if (!first) throw new Error("Missing fixture");
    const summary = summarize([
      ...transactions,
      { ...first, id: "income", amount: -100 },
      { ...first, id: "pending", amount: 50, pending: true },
    ]);
    expect(summary.outflow).toBeCloseTo(258.9);
    expect(summary.inflow).toBe(100);
    expect(summary.pendingOutflow).toBe(50);
    expect(summary.consumption).toBeCloseTo(233.9);
  });
  it("calcula transporte e viagens somente da amostra", async () => {
    const answer = await answerQuestion("Quanto gastei com transporte e viagens?");
    expect(answer.count).toBe(4);
    expect(summarize(answer.transactions ?? []).outflow).toBeCloseTo(155.4);
  });
  it("limita recentes a cinco registros", async () => {
    expect((await answerQuestion("Ver minhas últimas transações")).transactions).toHaveLength(5);
  });
  it("filtra período e conta e prevê conjunto vazio", async () => {
    expect(
      await demoFinanceService.getTransactions({
        accountId: "checking",
        start: "2026-11-01",
        end: "2026-11-13",
      }),
    ).toHaveLength(2);
    expect((await answerQuestion("Transações de 01/01/2025 a 02/01/2025")).count).toBe(0);
  });
  it("não gera números para preços de passagens", async () => {
    expect((await answerQuestion("Qual o preço de passagens?")).kind).toBeUndefined();
  });
  it("converte para BRL com taxa fixa fictícia, mantendo o USD original visível", () => {
    expect(DEMO_USD_BRL_RATE).toBe(5);
    expect(moneyBrl(110)).toBe("R$ 550,00");
    expect(moneyBrl(null)).toBe("Não informado");
    expect(moneyIn(110, "BRL")).toBe("R$ 550,00 · US$ 110,00");
    expect(moneyIn(110, "USD")).toBe("US$ 110,00");
    expect(moneyIn(null, "BRL")).toBe("Não informado");
  });
});
