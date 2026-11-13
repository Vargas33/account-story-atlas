import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUp, ChartNoAxesCombined, ChevronRight, CreditCard, Database, History, Landmark, Menu, MessageSquare, Plus, ShieldCheck, Trash2, Wallet, X, Plane, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { FinanceResults } from "./finance-results";
import { answerQuestion, type Filters } from "@/lib/demo-finance";
import { createThread, readThreads, saveThreads, type ChatMessage, type Thread } from "@/lib/conversations";
import coast from "@/assets/paraty-coast.jpg";
const suggestions = [
  { text: "Mostrar minhas contas", icon: Landmark },
  { text: "Consultar meus saldos", icon: Wallet },
  { text: "Ver minhas últimas transações", icon: CreditCard },
  { text: "Quanto gastei com transporte e viagens?", icon: Plane },
  { text: "Resumir minhas movimentações", icon: ChartNoAxesCombined },
];
export function MbvChat({ threadId }: { threadId?: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lastRequest, setLastRequest] = useState<{text: string; filters: Filters} | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const threadsRef = useRef<Thread[]>([]);
  const mounted = useRef(true);
  const busyRef = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    try { const saved = readThreads(); threadsRef.current = saved; setThreads(saved); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível abrir o histórico."); }
    setReady(true);
    textarea.current?.focus();
  }, []);
  const active = threads.find(t => t.id === threadId);
  const messages = active?.messages ?? [];
  function persist(next: Thread[]) {
    threadsRef.current = next; setThreads(next);
    try { saveThreads(next); }
    catch { setError("O navegador não permitiu salvar o histórico. Suas mensagens continuam disponíveis nesta sessão."); }
  }
  function updateThread(id: string, transform: (thread: Thread) => Thread) {
    persist(threadsRef.current.map(t => t.id === id ? transform(t) : t));
  }
  function newConversation() { const thread = createThread(); persist([thread, ...threadsRef.current]); setMenuOpen(false); navigate({ to: "/chat/$threadId", params: { threadId: thread.id } }); }
  async function send(text: string, filters: Filters = {}) {
    if (!text.trim() || busyRef.current || !ready) return;
    if (filters.start && filters.end && filters.start > filters.end) { setError("A data inicial deve ser anterior ou igual à data final."); return; }
    setError(""); setLastRequest({text, filters}); setInput(""); setBusy(true); busyRef.current = true;
    let current = threadsRef.current.find(t => t.id === threadId);
    if (!current) { current = createThread(); persist([current, ...threadsRef.current]); navigate({ to: "/chat/$threadId", params: { threadId: current.id } }); }
    const id = current.id;
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }] };
    updateThread(id, t => ({ ...t, title: t.messages.length ? t.title : text, updatedAt: new Date().toISOString(), messages: [...t.messages, user] }));
    textarea.current?.focus();
    try {
      // Simulated local processing, not an AI or banking network request.
      await new Promise(resolve => setTimeout(resolve, 450));
      const answer = await answerQuestion(text, filters);
      if (!mounted.current) return;
      updateThread(id, t => ({ ...t, messages: [...t.messages, { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: answer.text }], answer }] }));
    } catch { if (mounted.current) setError("Não foi possível consultar a amostra local. Tente novamente; nenhuma operação bancária foi realizada."); }
    finally { busyRef.current = false; if (mounted.current) { setBusy(false); textarea.current?.focus(); } }
  }
  function deleteThread(id: string) {
    if (!window.confirm("Excluir esta conversa do histórico deste navegador?")) return;
    persist(threadsRef.current.filter(t => t.id !== id));
    if (threadId === id) navigate({ to: "/" });
  }
  return <div className="app-shell">
    <div className={`mobile-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
    <aside className={`sidebar ${menuOpen ? "open" : ""}`} aria-label="Menu e histórico">
      <div className="brand"><div className="monogram">M</div><Link to="/" className="brand-name" onClick={() => setMenuOpen(false)}>MBV<span>VIAGENS</span></Link><Button variant="ghost" size="icon" className="mobile-menu ml-auto text-rail-foreground" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X /></Button></div>
      <Button variant="outline" className="sidebar-new" onClick={newConversation} disabled={!ready || busy}><Plus />Nova conversa</Button>
      <div className="rail-label">SEU PLANEJAMENTO</div>
      <Button variant="ghost" className="rail-button active" onClick={() => {setInfoOpen(false); setMenuOpen(false); textarea.current?.focus();}}><MessageSquare />Converse com o Barreto</Button>
      <Button variant="ghost" className="rail-button" onClick={() => { setMenuOpen(false); send("Mostrar minhas contas"); }} disabled={busy || !ready}><Landmark />Minhas contas</Button>
      <Button variant="ghost" className="rail-button" onClick={() => { setMenuOpen(false); send("Resumir minhas movimentações"); }} disabled={busy || !ready}><ChartNoAxesCombined />Minhas movimentações</Button>
      <div className="rail-label flex items-center gap-2"><History size={12} />CONVERSAS RECENTES</div>
      <div className="thread-list">{threads.length === 0 ? <p className="text-[11px] text-rail-muted px-3 py-2">Seu histórico começa aqui.</p> : threads.map(t => <div className={`thread-row ${t.id === threadId ? "selected" : ""}`} key={t.id}><Button variant="ghost" asChild className="thread-select" disabled={busy}><Link to="/chat/$threadId" params={{threadId: t.id}} onClick={() => setMenuOpen(false)}><MessageSquare size={13} /><span>{t.title}</span></Link></Button><Button variant="ghost" size="icon-sm" className="thread-delete" title="Excluir conversa" aria-label={`Excluir conversa: ${t.title}`} onClick={() => deleteThread(t.id)} disabled={busy}><Trash2 size={12} /></Button></div>)}</div>
      <div className="rail-data"><div className="flex items-center gap-2 text-xs"><Database size={14} />Plaid Sandbox</div><p>Amostra local · 4 contas · 6 transações</p><p>Nenhuma API integrada</p></div>
      <div className="travel-photo"><img src={coast} alt="Baía tropical com montanhas verdes e um veleiro" width={1152} height={576} loading="lazy" /><div className="travel-caption"><span>O próximo destino é seu.</span><ArrowUp className="rotate-45" size={13} /></div></div>
      <div className="sidebar-foot"><ShieldCheck size={13} />Uma demonstração, sem operações bancárias.</div>
    </aside>
    <main className="workspace">
      <header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon-sm" className="mobile-menu" aria-label="Abrir menu e histórico" onClick={() => setMenuOpen(true)}><Menu /></Button><MessageSquare size={17} className="text-primary" /><span className="hidden sm:inline">Barreto</span><ChevronRight size={13} className="hidden sm:block text-muted-foreground" /><span className="sm:hidden">MBV Viagens</span><span className="hidden sm:inline text-muted-foreground font-normal">Seu próximo destino começa aqui</span></div><div className="flex items-center gap-3"><div><div className="demo-badge"><span className="demo-dot" />Demonstração · Dados fictícios</div><p className="date-note">Referência: 13/11/2026</p></div><Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex text-muted-foreground" aria-label="Sobre esta demonstração" title="Sobre esta demonstração" onClick={() => setInfoOpen(!infoOpen)}><Info size={17} /></Button></div></header>
      {infoOpen && <section className="border-b border-border px-6 py-4 text-xs leading-6 bg-secondary"><strong>Sobre a demonstração</strong><p>Respostas simuladas, calculadas sobre 4 contas e 6 transações locais fictícias. Não há conexão ativa com Plaid, Pluggy ou IA. Não são os 14 registros de contas e 16 transações da consulta anterior. Histórico salvo apenas neste navegador. Valores em USD, sem conversão. O Barreto não fornece recomendação financeira.</p><Button variant="link" size="sm" onClick={() => setInfoOpen(false)}>Fechar</Button></section>}
      {error && <div role="alert" className="error-banner"><Info size={16} /><span className="flex-1">{error}</span>{lastRequest && <Button variant="ghost" size="icon-sm" title="Tentar novamente" aria-label="Tentar novamente" onClick={() => send(lastRequest.text,lastRequest.filters)} disabled={busy}><RotateCcw /></Button>}<Button variant="ghost" size="icon-sm" aria-label="Fechar aviso" onClick={() => setError("")}><X /></Button></div>}
      <Conversation className="transcript" key={threadId ?? "welcome"}>
        <ConversationContent className={messages.length ? "transcript-content" : "p-0 gap-0 min-h-full"}>
          {!messages.length ? <section className="welcome"><div className="agent-mark" aria-hidden="true">M</div><div className="welcome-eyebrow">SEU ASSISTENTE DE VIAGEM</div><h1>Olá! Sou o <span>Barreto,</span><br />assistente da MBV.</h1><p className="welcome-description">Quer ver se a sua próxima viagem cabe no orçamento?</p><p className="suggestion-label">Por onde vamos começar?</p><div className="suggestion-grid">{suggestions.map(({text,icon: Icon}) => <Button variant="outline" className="suggestion" key={text} disabled={busy || !ready} onClick={() => send(text)}><span className="suggestion-icon"><Icon size={17} /></span><span>{text}</span><ArrowRight className="suggestion-arrow" /></Button>)}</div><p className="welcome-note"><ShieldCheck size={14} className="shrink-0" />Dados fictícios. Conversa tranquila. Nenhuma operação bancária.</p></section> : messages.map(m => <Message key={m.id} from={m.role} className="max-w-full">{m.role === "assistant" && <div className="assistant-label"><span className="assistant-avatar">M</span>Barreto<span className="text-[10px] text-muted-foreground font-normal">· resposta simulada</span></div>}<MessageContent className={m.role === "user" ? "user-message" : "assistant-message"}>{m.parts.map((p,i) => <MessageResponse key={i}>{p.text}</MessageResponse>)}{m.answer && <FinanceResults answer={m.answer} onFilter={f => send("Listar transações por período e conta",f)} />}</MessageContent></Message>)}
          {busy && <div className="assistant-message" role="status"><div className="assistant-label"><span className="assistant-avatar">M</span>Barreto</div><Shimmer>Consultando a amostra fictícia…</Shimmer></div>}
        </ConversationContent><ConversationScrollButton aria-label="Ir para as últimas mensagens" />
      </Conversation>
      <div className="composer-wrap"><PromptInput className="composer" maxFiles={0} onSubmit={({text}) => send(text)}><PromptInputTextarea ref={textarea} aria-label="Mensagem para o Barreto" placeholder="Pergunte ao Barreto sobre suas contas e gastos…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {if (busy && e.key === "Enter" && !e.shiftKey) e.preventDefault();}} /><PromptInputFooter className="composer-footer"><span className="composer-source"><Database size={12} />Amostra local · Plaid Sandbox</span><PromptInputSubmit className="send-button" aria-label="Enviar mensagem" title="Enviar mensagem" status={busy ? "submitted" : "ready"} disabled={!input.trim() || busy || !ready}>{!busy && <ArrowUp size={17} />}</PromptInputSubmit></PromptInputFooter></PromptInput><p className="composer-disclaimer">Respostas simuladas · Sem recomendação financeira · Valores em USD</p></div>
    </main>
  </div>;
}