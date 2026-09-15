# payments-api

Contoso payments and settlement API. Node 22, Express.

## What this repo demos

**Scheduled GitHub App full scans.** `socket-heartbeat.yml` pushes a timestamp
to `main` every 4 hours. Push to the default branch is the *only* event that
creates a full scan, and it needs no manifest change, so this keeps the
dashboard fresh. Socket's own scheduled re-scan is roughly weekly on paid
plans, far too slow for a demo.

**A fresh PR comment every day.** `socket-pr-churn.yml` opens a PR that
downgrades one direct dependency to a version carrying real alerts, rotating
daily between `minimist`, `jsonwebtoken` and `lodash`.

### Why it edits package.json and not the lockfile

Socket posts two independent PR comments with different gates:

| Comment | Fires when |
|---|---|
| Alert comment | There are NEW alerts versus the base branch |
| Dependency overview | A DIRECT dependency changed |

Transitive-only churn, such as a lockfile pin bump with `package.json`
untouched, posts **neither comment**. That is by design, not a bug.

### The rotation, verified against the Socket API

| Package | main | PR | Result |
|---|---|---|---|
| `minimist` | 1.2.8 | 1.2.5 | 0 alerts to **1 critical CVE** |
| `jsonwebtoken` | 9.0.2 | 8.5.1 | 1 low to 1 high + 2 medium CVE |
| `lodash` | 4.17.21 | 4.17.20 | 8 alerts to 10, adds a medium CVE |

`minimist` is the cleanest story: a single critical appearing against a clean
baseline. PRs are never merged, so the base never drifts.

`axios` was evaluated and rejected. `axios@1.7.7` carries *more* alerts (36)
than `axios@0.21.0` (33), so upgrading it does not reduce anything.

## Required secrets

- `SOCKET_SECURITY_API_TOKEN`
- `DEMO_PUSH_TOKEN` — a PAT with `repo` and `workflow`. Used instead of
  `GITHUB_TOKEN` so there is no ambiguity about event suppression on
  token-authored pushes.
