import { createFileRoute } from "@tanstack/react-router";
import { MbvChat } from "@/components/mbv-chat";
export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Sua conversa com Barreto — MBV Viagens" },
      {
        name: "description",
        content:
          "Continue sua conversa com o Barreto e consulte os dados financeiros fictícios da MBV Viagens.",
      },
      { property: "og:title", content: "Sua conversa com Barreto — MBV Viagens" },
      {
        property: "og:description",
        content:
          "Histórico de planejamento de viagem com dados educacionais fictícios, sem operações bancárias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreadPage,
});
function ThreadPage() {
  const { threadId } = Route.useParams();
  return <MbvChat key={threadId} threadId={threadId} />;
}
