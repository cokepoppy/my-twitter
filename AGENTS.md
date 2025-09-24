# Repository Guidelines

## Project Structure & Module Organization
- `frontend/` — Vue 3 + TypeScript (Vite, Tailwind). Key folders: `src/components`, `src/views`, `src/stores`, `src/router`, `src/types`.
- `backend/` — Express + TypeScript. Key folders: `src/routes`, `src/controllers`, `src/services`, `src/middleware`, `src/types`, `prisma/`.
- `database/` — SQL init scripts. `docker/` — Nginx and compose assets. `doc/` and `docs/` — documentation.

## Build, Test, and Development Commands
- Bootstrap: `node scripts/setup.js` (creates `.env`, installs deps, runs Prisma generate/migrate).
- Frontend dev: `cd frontend && npm run dev` (Vite on `http://localhost:3000`).
- Backend dev: `cd backend && npm run dev` (API on `http://localhost:8000`).
- Build: `npm run build` in `frontend/` and `backend/`; backend start: `npm start`.
- Docker (full stack): `docker-compose up --build`.

## Coding Style & Naming Conventions
- Formatting (Prettier): 2 spaces, single quotes, no semicolons, trailing commas (ES5). Run `npm run format`.
- Linting (ESLint): TypeScript + Vue rules. Run `npm run lint` in each package.
- Naming: Vue components PascalCase (e.g., `src/views/Home.vue`); TypeScript files lowercase/kebab-case where practical (e.g., `routes/users.ts`); variables/functions camelCase; classes PascalCase; constants UPPER_SNAKE_CASE.
- Imports: prefer path alias `@/*` in both apps.

## Testing Guidelines
- Backend: Jest + ts-jest + supertest. Place tests alongside modules as `*.test.ts` or under `src/__tests__/`.
  - Run: `cd backend && npm test` (watch: `npm run test:watch`).
  - Aim for meaningful coverage (~80%); cover routes and services.
- Frontend: tests not configured; if adding, use Vitest + Vue Test Utils; name files `*.spec.ts` under `src/`.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Example: `feat(auth): add JWT refresh endpoint`.
- PRs: clear description, linked issues, test steps, screenshots for UI changes, and notes for DB migrations or new env vars. Keep PRs scoped and passing lint/build.

## Security & Configuration Tips
- Do not commit secrets. Copy `backend/.env.example` → `backend/.env`; set `PORT`, `FRONTEND_URL`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`.
- Frontend requires `VITE_API_URL` and `VITE_SOCKET_URL` in `frontend/.env`.
- Prefer `docker-compose` for consistent MySQL/Redis; document any schema or ENV changes in `doc/`.
