import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Plane,
  Wallet,
  Bus,
  Activity,
} from "lucide-react";
import {
  accountTotals,
  accounts,
  displayDate,
  moneyIn,
  summarize,
  type Answer,
  type Currency,
  type Filters,
} from "@/lib/demo-finance";
import { Button } from "@/components/ui/button";
export function FinanceResults({
  answer,
  onFilter,
  currency = "USD",
}: {
  answer: Answer;
  onFilter: (filters: Filters) => void;
  currency?: Currency;
}) {
  const totals = answer.accounts ? accountTotals(answer.accounts) : undefined;
  const summary = answer.transactions ? summarize(answer.transactions) : undefined;
  return (
    <>
      {answer.kind === "balances" && totals && (
        <div className="result-totals">
          <div>
            <span>Dinheiro disponível</span>
            <strong className="text-positive">{moneyIn(totals.available, currency)}</strong>
          </div>
          <div>
            <span>Dívidas de cartões</span>
            <strong>{moneyIn(totals.debt, currency)}</strong>
          </div>
          <div>
            <span>Limites totais de crédito</span>
            <strong>{moneyIn(totals.limit, currency)}</strong>
          </div>
        </div>
      )}
      {answer.accounts && (
        <div className="account-grid">
          {answer.accounts.map((a) => (
            <article key={a.id} className="account-item">
              <div className="flex items-center justify-between text-primary">
                {a.type === "Cartão de crédito" ? <CreditCard size={17} /> : <Landmark size={17} />}
                <span className="text-[10px] text-muted-foreground">
                  {a.type} · {a.currency}
                </span>
              </div>
              <h3>{a.name}</h3>
              <dl>
                <div>
                  <dt>{a.type === "Cartão de crédito" ? "Dívida" : "Saldo atual"}</dt>
                  <dd>{moneyIn(a.current, currency)}</dd>
                </div>
                <div>
                  <dt>{a.type === "Cartão de crédito" ? "Crédito disponível" : "Disponível"}</dt>
                  <dd>{moneyIn(a.available, currency)}</dd>
                </div>
                {a.type === "Cartão de crédito" && (
                  <div>
                    <dt>Limite de crédito</dt>
                    <dd>{moneyIn(a.limit, currency)}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      )}
      {answer.kind === "transactions" && (
        <form
          className="filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            onFilter({
              accountId: String(data.get("accountId") || ""),
              start: String(data.get("start") || ""),
              end: String(data.get("end") || ""),
            });
          }}
        >
          <label>
            Conta
            <select name="accountId" aria-label="Filtrar por conta">
              <option value="">Todas as contas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            De
            <input name="start" type="date" aria-label="Data inicial" max="2026-11-13" />
          </label>
          <label>
            Até
            <input name="end" type="date" aria-label="Data final" max="2026-11-13" />
          </label>
          <Button type="submit" size="sm">
            Filtrar
          </Button>
        </form>
      )}
      {answer.kind === "summary" && summary && (
        <>
          <div className="result-totals">
            <div>
              <span>Saídas confirmadas</span>
              <strong>{moneyIn(summary.outflow, currency)}</strong>
            </div>
            <div>
              <span>Entradas confirmadas</span>
              <strong>{moneyIn(summary.inflow, currency)}</strong>
            </div>
            <div>
              <span>Consumo confirmado</span>
              <strong>{moneyIn(summary.consumption, currency)}</strong>
            </div>
          </div>
          <div className="mt-4">
            {summary.categories.map((c) => (
              <div key={c.category} className="category-row">
                <span>{c.category}</span>
                <div className="category-bar">
                  <progress
                    value={c.total}
                    max={Math.max(...summary.categories.map((x) => x.total), 1)}
                    aria-label={`${c.category}: ${moneyIn(c.total, currency)}`}
                  />
                </div>
                <strong>{moneyIn(c.total, currency)}</strong>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Saídas pendentes: {moneyIn(summary.pendingOutflow, currency)} · Pagamento de dívida não
            é consumo.
          </p>
        </>
      )}
      {answer.transactions && answer.kind !== "summary" && (
        <div className="transaction-list">
          {answer.transactions.map((t) => (
            <div className="transaction-row" key={t.id}>
              <div className="transaction-icon">
                {t.category === "Transporte" ? (
                  <Bus size={16} />
                ) : t.category === "Viagens" ? (
                  <Plane size={16} />
                ) : t.category === "Pagamento de dívida" ? (
                  <CreditCard size={16} />
                ) : (
                  <Activity size={16} />
                )}
              </div>
              <div className="transaction-details">
                <strong>{t.name}</strong>
                <span>
                  {displayDate(t.date)} ·{" "}
                  {accounts.find((a) => a.id === t.accountId)?.name ?? "Não informado"}
                </span>
                <span>
                  {t.category} · {t.pending ? "Pendente" : "Confirmada"}
                </span>
              </div>
              <div className="transaction-amount">
                {moneyIn(Math.abs(t.amount), currency)}
                <small className="flex items-center justify-end gap-1">
                  {t.amount < 0 ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                  {t.amount < 0 ? "Entrada" : "Saída"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
      {answer.period && (
        <p className="answer-meta">
          {answer.accounts ? "Referência" : "Período"}: {answer.period} · {answer.count} registros
          analisados
          <br />
          Amostra local fictícia · Referência de origem: Plaid Sandbox · Resposta simulada
          {currency === "BRL" && (
            <>
              <br />
              Taxa de demonstração: 1 USD = R$ 5,00, fixa e fictícia · Não é cotação em tempo real
            </>
          )}
        </p>
      )}
    </>
  );
}
