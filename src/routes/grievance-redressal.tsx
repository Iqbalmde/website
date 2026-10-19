import { createFileRoute } from "@tanstack/react-router";
import LegalPage, { legalPages } from "@/components/LegalPage";

export const Route = createFileRoute("/grievance-redressal")({
  head: () => ({
    meta: [
      { title: "Grievance Redressal · Zelantrix" },
      { name: "description", content: "Grievance Redressal for the Zelantrix website. Draft for owner and legal review." },
    ],
  }),
  component: () => <LegalPage page={legalPages.grievance} />,
});
