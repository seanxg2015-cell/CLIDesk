# AGENTS.md

This file provides guidance to AI coding assistants working in this repository.

## Commands

### Development
- `pnpm dev` - Run Electron app in development mode with hot reload
- `pnpm debug` - Start with debugging (attach via `chrome://inspect` on port 9222)

### Build & Typecheck
- `pnpm build` - Full build (generate:openapi + typecheck + electron-vite build)
- `pnpm typecheck` - TypeScript check (concurrent node + web via tsgo)
- `pnpm typecheck:node` - TypeScript check for main process
- `pnpm typecheck:web` - TypeScript check for renderer process

### Testing
- `pnpm test` - Run all Vitest tests (main + renderer + aiCore + shared + scripts)
- `pnpm test:main` - Main process tests only (Node environment)
- `pnpm test:renderer` - Renderer process tests only (jsdom environment)
- `pnpm test:aicore` - aiCore package tests only
- `pnpm test:shared` - shared package tests only
- `pnpm test:watch` - Watch mode
- `pnpm test:coverage` - With v8 coverage report
- `pnpm test:e2e` - Playwright end-to-end tests
- **Single test**: `pnpm vitest run --project <project> <path>` (e.g., `pnpm vitest run --project renderer src/renderer/src/hooks/useChatContext.test.ts`)

### Linting & Formatting
- `pnpm lint` - Full lint (oxlint + eslint fix + typecheck + i18n check + format check)
- `pnpm format` - Biome format + lint (write mode)
- `pnpm format:check` - Biome format + lint check only
- `pnpm test:lint` - oxlint + eslint check only (no fixes)

### i18n
- `pnpm i18n:check` - Validate i18n completeness
- `pnpm i18n:sync` - Sync i18n template keys
- `pnpm i18n:translate` - Auto-translate missing keys

## Code Style Guidelines

### Formatting (Biome)
- 2-space indentation, single quotes, trailing commas: none
- Line width: 120 characters
- JSX uses double quotes

### Import Order (ESLint simple-import-sort)
1. Node built-in (e.g., `path`, `fs`)
2. External packages (e.g., `react`, `lodash`)
3. Aliases (`@main`, `@renderer`, `@shared`, `@logger`)
4. Relative imports (e.g., `../`, `./`)

### Naming Conventions
- React components: `PascalCase.tsx` (e.g., `ChatMessage.tsx`)
- Services/hooks/utilities: `camelCase.ts` (e.g., `loggerService.ts`, `useChatContext.ts`)
- Test files: `*.test.ts` or `*.spec.ts` alongside source or in `__tests__/`

### TypeScript
- Strict mode enabled
- Use `tsgo` for typechecking
- Centralized types in `src/renderer/src/types/` and `packages/shared/`
- Define interfaces in same file as usage or in dedicated types file

### Error Handling
- Use typed error classes for domain errors
- Wrap async operations in try/catch
- Log errors via `loggerService` (never use `console.log`)

### React Patterns
- Functional components with hooks
- Use `@testing-library/react` for component tests
- Follow React 19 patterns

### i18n
- All user-visible strings must use `i18next`
- Never hardcode UI strings
- Locale files in `src/renderer/src/i18n/`

### Logging
- Always use `loggerService` from `@logger`
- Include structured context objects
- Never use `console.log`

## Project Structure

```
src/
  main/          # Node.js backend (Electron main process)
  renderer/      # React UI (Electron renderer process)
  preload/       # Secure IPC bridge
packages/
  aiCore/        # @cherrystudio/ai-core — AI SDK middleware
  shared/        # Cross-process types and constants
```

### Key Path Aliases
| Alias | Resolves To |
|-------|-------------|
| `@main` | `src/main/` |
| `@renderer` | `src/renderer/src/` |
| `@shared` | `packages/shared/` |
| `@logger` | Main: `src/main/services/LoggerService`<br/>Renderer: `src/renderer/src/services/LoggerService` |
| `@cherrystudio/ai-core` | `packages/aiCore/src/` |

## Important Notes

- **Redux/IndexedDB blocked**: Feature PRs affecting Redux data models or IndexedDB schemas are temporarily blocked until v2.0.0 (see [#10162](https://github.com/CherryHQ/cherry-studio/pull/10162))
- **V2 refactoring**: Files with `@deprecated` headers are blocked for feature changes
- **Pre-commit check**: Run `pnpm build:check` before commits
- **Patches**: Several dependencies have patches in `patches/` - be careful upgrading

## Pull Request & Issue Workflow

- Use `gh-create-pr` skill for PRs (see `.agents/skills/gh-create-pr/SKILL.md`)
- Use `gh-create-issue` skill for issues (see `.agents/skills/gh-create-issue/SKILL.md`)

For more details, see `CLAUDE.md`.