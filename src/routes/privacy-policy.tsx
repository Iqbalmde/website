import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { legalPages } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Zelantrix" },
      { name: "description", content: "Privacy Policy for the Zelantrix website. Draft for owner and legal review." },
    ],
  }),
  component: () => <LegalPage page={legalPages.privacy} />,
});
