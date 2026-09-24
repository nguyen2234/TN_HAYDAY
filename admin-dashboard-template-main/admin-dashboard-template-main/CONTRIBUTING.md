# Contributing to Admin Dashboard Template

Thanks for your interest in improving this template! This document covers everything you need to get productive quickly.

## Prerequisites

| Tool    | Version |
| ------- | ------- |
| Node.js | ≥ 22 |
| pnpm    | ≥ 11 |

## Getting started

```bash
git clone https://github.com/tomtapia/admin-dashboard-template.git
cd admin-dashboard-template
pnpm install
pnpm dev          # http://localhost:5173 (MSW mock API starts automatically)
```

Run a single test file with `pnpm vitest run src/test/app-router.test.tsx`.

## Project scripts

| Command           | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `pnpm dev`        | Vite dev server + MSW worker                     |
| `pnpm build`      | `tsc -b` typecheck + production build to `dist/` |
| `pnpm test`       | Vitest suite (unit/integration, jsdom)           |
| `pnpm e2e`        | Playwright suite (boots `pnpm dev` itself)       |
| `pnpm typecheck`  | `tsc -b` alone                                   |
| `pnpm lint`       | Biome check                                      |
| `pnpm lint:fix`   | Biome autofix                                    |
| `pnpm format`     | Biome format write                               |

For architecture conventions and the recipe for adding new modules, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Branching

Name branches by change type:

- `feat/<feature-name>`
- `fix/<fix-name>`
- `refactor/<description>`

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/). The commit type drives release versioning (`feat` → minor, `fix` → patch):

```text
feat(users): add CSV export to the roster table
fix(theme): raise muted-foreground contrast on dark palettes
docs(readme): document the demo deployment pipeline
chore(deps): bump vite to 6.4.3
```

A Husky pre-commit hook runs Biome (lint + format) on staged files via lint-staged — if it rewrites anything, restage and re-commit.

## Testing expectations

- **Every mock endpoint must be covered.** Test setup fails on unhandled fetches (`onUnhandledRequest: "error"`), so any feature that fetches needs an MSW handler in `src/mocks/handlers.ts`.
- Unit/integration tests live in `src/test/`; E2E specs in `e2e/`.
- Accessibility is part of the contract (WCAG 2.2 AA): extend `src/test/a11y.test.tsx` when adding routes.
- Run `pnpm test && pnpm e2e` locally before opening a PR.

## Submitting a pull request

1. Fork / branch from `main`.
2. Keep the PR focused; separate unrelated changes into separate PRs.
3. Fill out the PR template checklist.
4. CI must pass: typecheck → Biome → unit tests → build → Playwright E2E.
5. PR titles must follow Conventional Commits (they become changelog entries).

Releases are cut by maintainers with Commitizen: `pnpm dlx czg bump`, then `git push origin main --follow-tags`, then create the GitHub release from the regenerated `CHANGELOG.md`. Publishing a release also deploys the live demo to Vercel.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
