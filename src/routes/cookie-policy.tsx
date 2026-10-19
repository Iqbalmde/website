import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { legalPages } from "@/components/LegalPage";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy · Zelantrix" },
      { name: "description", content: "Cookie Policy for the Zelantrix website. Draft for owner and legal review." },
    ],
  }),
  component: () => <LegalPage page={legalPages.cookie} />,
});
