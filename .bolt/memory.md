# Project memory

## Product intent & audience

- Web project with standard frontend structure: `index.html`, `style.css`, `script.js`, plus `package.json`, `package-lock.json`, `.gitignore`, `.bolt/config.json`.
- User communicates in Russian.

## Brand personality & voice

- Assistant responds in Russian to match user's language.
- Tone is direct and helpful; explains environment limitations plainly.

## Visual design & UX direction

- Not yet inferred from available context.

## Decisions, constraints & rationale

- Environment is Linux-based; `zip` CLI unavailable — Python used as fallback to create real `.zip` archives.
- `node_modules` and `.git` excluded from archive exports.
- Assistant cannot attach files to messages or generate download links; users must use Bolt UI export/download button to obtain the archive.
- Project size is small (~39 KB without `node_modules`/`.git`).

## Open questions & assumptions

- No `.bolt/prompt` provided; no explicit global instructions exist yet.
- Exact product purpose and feature scope unknown — only file structure is visible.
- Visual/UX design direction not yet established or inferred.