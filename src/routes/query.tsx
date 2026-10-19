import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import Shell from "@/components/Shell";

export const Route = createFileRoute("/query")({
  head: () => ({
    meta: [
      { title: "Query · Zelantrix" },
      { name: "description", content: "Prepare a query for the Zelantrix founders. Nothing is sent or stored by this page." },
    ],
  }),
  component: Query,
});

const topics = ["General enquiry", "Research", "Partnerships", "Privacy request", "Grievance"];

function Query() {
  const [topic, setTopic] = useState(topics[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [mailto, setMailto] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMailto(
      "mailto:raihan@zelantrix.com?subject=" +
        encodeURIComponent("[" + topic + "] " + subject.trim()) +
        "&body=" +
        encodeURIComponent(message.trim()),
    );
  };

  return (
    <Shell variant="page">
      <article className="policy-page colc">
        <div className="lbl">Zelantrix, Inc. · Legal &amp; privacy</div>
        <h1 className="hero">Query</h1>
        <p className="policy-date">Updated · 19 October 2026</p>
        <p className="p">For research, partnerships, website questions or privacy requests, prepare a message for Raihan using his existing founder contact.</p>
        <div className="policy-body">
          <form className="query-form" onSubmit={onSubmit} onChange={() => setMailto(null)}>
            <label className="fld">
              <span className="lbl">Topic</span>
              <select className="in" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="fld">
              <span className="lbl">Subject</span>
              <input className="in" maxLength={160} required value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="fld">
              <span className="lbl">Message</span>
              <textarea className="in" maxLength={3000} required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <p className="query-note">Do not include passwords, identity documents or confidential factory data. This page does not send or store a ticket. You will send the message through your own email application.</p>
            <button className="policy-button policy-button-solid" type="submit">Prepare Email ↗</button>
            {mailto && (
              <div className="query-result" role="status">
                <p className="p">Your email draft is ready—not sent.</p>
                <a className="policy-button policy-button-solid" href={mailto}>Open Email App ↗</a>
                <p className="query-note">No email app? Send your subject and message to raihan@zelantrix.com using your email service.</p>
              </div>
            )}
          </form>
          <h2>Privacy requests and complaints</h2>
          <p>For a privacy request, specify the right you want to exercise and relevant country. For a complaint, include what happened, relevant dates and the resolution you seek. Read <a href="/grievance-redressal">Grievance Redressal</a> for the proposed escalation process. No dedicated privacy email or grievance officer has yet been designated.</p>
          <p>You can also reach the other founders on the <a href="/contact">Contact page</a>.</p>
        </div>
        <div className="policy-related">
          <a aria-current="page" className="active" href="/query">Query ↗</a>
          <a href="/grievance-redressal">Grievance Redressal ↗</a>
          <a href="/contact">Contact ↗</a>
        </div>
      </article>
    </Shell>
  );
}
