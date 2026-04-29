# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static single-page HTML site for "Bloco 1" — a residential building — displaying community coexistence rules and a WhatsApp group invite QR code. No build system, framework, or dependencies beyond a CDN-loaded QRCode library.

## Development

Open `index.html` directly in a browser — no server required. To serve locally:

```bash
python3 -m http.server 8080
```

## Architecture

Everything lives in `index.html`:

- **Styles** — inline `<style>` block; purple/pink brand palette (`#3a1030`, `#c0407a`), responsive via `clamp()` and `@media`.
- **Sections** — each rule category is a `.section` with a `.section-toggle` button; open/close state is toggled via the `open` CSS class, using `grid-template-rows: 0fr → 1fr` for smooth animation.
- **QR code** — generated at runtime by `qrcodejs` from CDN, targeting the WhatsApp group link.
- **Logo** — `images.png` in the project root.

## Content edits

- To add a rule card: copy a `.rule-card` div inside the relevant `.section`'s `.rules-grid`.
- To add a new section: copy an entire `.section` div and update the label and cards inside it.
- The WhatsApp link appears in two places: the `<a class="wa-btn">` href and the `QRCode` constructor `text` value — keep them in sync.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
