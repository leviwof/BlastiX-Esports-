# AI Coding Workflow — Agent Skills · Ponytail · Graphify

A portable, stage-by-stage workflow for building features with AI coding agents
(Claude Code, Cursor, etc.). Copy this file into any project.

> Note: OmniRoute was intentionally left out. It performs MITM TLS decryption,
> traffic-fingerprint stealth, and holds all your provider API keys — and its
> "free tokens" pitch relies on circumventing provider limits (ToS/ban risk).
> If you hit usage limits, add a paid API-key fallback instead.

---

## Install (run in your project root)

```bash
# 1. Agent Skills (the workflow backbone) — lowest risk, install first
npx --yes skills add addyosmani/agent-skills

# 2. Ponytail (leaner output) — Claude Code plugin, type these as slash commands:
#    /plugin marketplace add DietrichGebert/ponytail
#    /plugin install ponytail@ponytail

# 3. Graphify (cheaper context on big repos) — mind the double "y"
pip install graphifyy
graphify install
```

---

## 1. Agent Skills — stage → command

| When you're...                         | Command          |
|----------------------------------------|------------------|
| Starting a feature, defining what/why  | `/spec`          |
| Turning the spec into an approach      | `/plan`          |
| Locking scope & boundaries             | `/constraints`   |
| Writing the code                       | `/build`         |
| Adding / running tests                 | `/test`          |
| Checking front-end performance         | `/webperf`       |
| Tidying without adding features        | `/code-simplify` |
| Reviewing before merge                 | `/review`        |
| Shipping / release prep                | `/ship`          |

Full feature run: `/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship`.
Small change? Jump straight to `/build`.

## 2. Ponytail — mostly passive

Runs in the background on every edit (pushes reuse over new code). On demand:

- `/ponytail`        — apply the "write less code" lens right now
- `/ponytail-review` — review a diff for bloat / missed reuse
- `/ponytail-audit`  — audit existing code for needless complexity

When: run `/ponytail-review` just before `/review`; `/ponytail-audit` when a
module feels heavier than it should.

## 3. Graphify — build once, query many times

```bash
graphify            # run in repo root — builds the knowledge graph
graphify --help     # confirm exact subcommands/flags for your version
```

Outputs `graph.html` (visual), `GRAPH_REPORT.md`, `graph.json`. The agent then
queries the graph instead of re-reading files. Rebuild after meaningful changes
(new modules, big refactor). Optional on small/stable repos.

---

## Putting it together (one feature)

1. Build/refresh the graph first: `graphify`  (cheaper lookups downstream)
2. `/spec` → `/plan` → `/build`  (Ponytail runs passively during build)
3. `/ponytail-review` on the diff, then `/test`
4. `/review` → `/ship`
