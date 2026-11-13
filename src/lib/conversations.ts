import type { Answer } from "./demo-finance";
export type ChatMessage = { id: string; role: "user" | "assistant"; parts: { type: "text"; text: string }[]; answer?: Answer };
export type Thread = { id: string; title: string; updatedAt: string; messages: ChatMessage[] };
const KEY = "mbv-demo-conversations-v1";
export function readThreads(): Thread[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) throw new Error("Histórico inválido");
    return value.filter((t): t is Thread => typeof t === "object" && t !== null && typeof t.id === "string" && typeof t.title === "string" && Array.isArray(t.messages) && t.messages.every((m: ChatMessage) => Array.isArray(m.parts)));
  } catch { throw new Error("Não foi possível abrir o histórico neste navegador. Você ainda pode iniciar uma nova conversa."); }
}
export function saveThreads(threads: Thread[]) { localStorage.setItem(KEY, JSON.stringify(threads)); }
export function createThread(): Thread { return { id: crypto.randomUUID(), title: "Nova conversa", updatedAt: new Date().toISOString(), messages: [] }; }