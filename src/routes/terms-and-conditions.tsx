import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { legalPages } from "@/components/LegalPage";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · Zelantrix" },
      { name: "description", content: "Terms & Conditions for the Zelantrix website. Draft for owner and legal review." },
    ],
  }),
  component: () => <LegalPage page={legalPages.terms} />,
});
