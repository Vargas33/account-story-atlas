import { createFileRoute } from "@tanstack/react-router";
import { MbvChat } from "@/components/mbv-chat";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MBV Viagens — Converse com o Barreto" },
      {
        name: "description",
        content:
          "Planeje sua próxima viagem com o Barreto. Demonstração educacional com contas, saldos e transações fictícias em USD.",
      },
      { property: "og:title", content: "MBV Viagens — Converse com o Barreto" },
      {
        property: "og:description",
        content:
          "Uma conversa sobre suas contas e sua próxima viagem, com dados fictícios e transparência.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <MbvChat />;
}
