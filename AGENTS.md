<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All admin writes and admin log reads go through the single `adminApi` server function (src/lib/admin.functions.ts), which verifies an HS256 JWT signed with ADMIN_JWT_SECRET; no client writes to tables — keeps one audited security boundary.
- Styling is plain CSS in src/styles.css (no Tailwind utilities/UI kits) — user requirement.
- research-pdfs bucket is private (workspace blocks public buckets); public reads get signed URLs from `listResearch`.
