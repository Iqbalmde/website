import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import SideField from "./SideField";
import { clearToken } from "@/lib/admin-session";

type Variant = "home" | "page" | "admin" | "signin";

function PublicNav() {
  return (
    <nav className="nav">
      <a href="https://tryzelpi.com/" target="_blank" rel="noopener">Zelpi</a>
      <Link to="/blog">Blog</Link>
      <Link to="/research">Research</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}

function AdminNav() {
  const navigate = useNavigate();
  return (
    <nav className="nav">
      <Link to="/admin/research">Research</Link>
      <Link to="/admin/blogs">Blogs</Link>
      <Link to="/admin/logs">Logs</Link>
      <button type="button" onClick={() => { clearToken(); navigate({ to: "/admin", replace: true }); }}>Sign out</button>
    </nav>
  );
}

export default function Shell({ variant, wide, children }: { variant: Variant; wide?: boolean; children: ReactNode }) {
  return (
    <div className="shell">
      <SideField side="left" />
      <SideField side="right" />
      {variant !== "signin" && (
        <header className={`hdr${variant === "page" ? "" : " end"}`}>
          {variant === "page" && <Link to="/" className="home-link">← Home</Link>}
          {variant === "admin" ? <AdminNav /> : <PublicNav />}
        </header>
      )}
      <main className="stage">
        {children}
        <footer className={wide ? "col" : "colc"}>
          <div className="ftr">© 2026 ZELANTRIX, INC.</div>
        </footer>
      </main>
    </div>
  );
}
