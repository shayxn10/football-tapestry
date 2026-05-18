import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup Analytics — 1930 to 2022" },
      { name: "description", content: "Interactive FIFA World Cup analytics dashboard: 90+ years of goal data, Qatar 2022 tactical breakdown, and the key insights that predict scoring." },
      { property: "og:title", content: "FIFA World Cup Analytics Dashboard" },
      { property: "og:description", content: "Historical goal patterns and tactical analysis from every World Cup, 1930–2022." },
    ],
  }),
  component: Dashboard,
});
