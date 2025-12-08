# Build Service (Elysia + Bun)

Automated build & deployment backend for Zyotra. Handles cloning, building, packaging, and delivering artifacts to S3; premium users can leverage dockerized builds and deployments to isolated VPS agents.

## Features
- Elysia + Bun HTTP API ([src/index.ts](src/index.ts))
- JWT-protected routes via [`middlewares/checkAuth.checkAuthPlugin`](src/middlewares/checkAuth.ts)
- Git cloning with [`controllers/cloneRepoController`](src/controllers/cloneRepoController.ts)
- Build orchestration with [`controllers/BuildRepoController`](src/controllers/BuildRepoController.ts)
- Artifact upload to S3 with [`controllers/uploadBuildController`](src/controllers/uploadBuildController.ts) → [`bucket/uploadFile`](src/bucket/uploadFile.ts)
- Utility checks: repo URL validation ([`utils/checkUrl`](src/utils/checkUrl.ts)), size gating ([`utils/checkSize`](src/utils/checkSize.ts)), repo existence ([`utils/checkRepoId`](src/utils/checkRepoId.ts)), ID generation ([`utils/generateId`](src/utils/generateId.ts))
- Premium-only dockerized build/deploy pipeline (see below)

## Project Structure
- [src/index.ts](src/index.ts) — server bootstrap and route wiring
- Controllers: [clone](src/controllers/cloneRepoController.ts), [build](src/controllers/BuildRepoController.ts), [upload](src/controllers/uploadBuildController.ts)
- S3 client: [`bucket/s3`](src/bucket/s3.ts)
- Auth: [`middlewares/checkAuth`](src/middlewares/checkAuth.ts), [`jwt/verifyTokens`](src/jwt/verifyTokens.ts)
- Types: [`types/types`](src/types/types.ts)
- Utils: [`utils`](src/utils)

## Prerequisites
- Bun runtime
- Git client
- AWS S3-compatible endpoint/credentials
- JWT secret for access tokens
- Optional: Docker (for premium builds/deploys) and SSH access to VPS agents

## Environment Variables
Create a `.env` (or export in your environment):
- `PORT` — HTTP port (default: `5052`)
- `S3_REGION`
- `S3_ENDPOINT` (if using a custom S3-compatible store)
- `ACCESS_KEY_ID`
- `SECRET_ACCESS_KEY`
- `BUCKET_NAME` (used by uploader)
- `ACCESS_TOKEN_SECRET` (JWT verification in [`jwt/verifyTokens`](src/jwt/verifyTokens.ts))

## Install & Run
```bash
bun install
bun run dev
```
Server listens on `PORT` and logs host/port at startup.

## API
All routes are protected by `Authorization: Bearer <token>` via [`checkAuthPlugin`](src/middlewares/checkAuth.ts).

### POST /clone-repo
- Body: `{ repoUrl, packageInstallerCommand?, buildCommand?, startCommand?, outputDir?, projectType? }`
- Validates URL ([`checkUrl`](src/utils/checkUrl.ts)) and size ([`checkSize`](src/utils/checkSize.ts)); clones into `./cloned-repo/<id>`.
- Returns repo metadata and defaults (build/start commands, outputDir).

### POST /build-repo
- Body: `{ repoId, buildCommand, startCommand, outputDir, projectType, packageInstallerCommand }`
- Runs install + build (via Bun `spawn`) in `./cloned-repo/<repoId>`.
- Ensures `outputDir` exists before returning build metadata.

### POST /upload-build
- Body: `{ repoId, outputDir, startCommand }`
- Streams `./cloned-repo/<repoId>/<outputDir>` to S3 using [`uploadFile`](src/bucket/uploadFile.ts); keys are prefixed with `<repoId>/`.

## Premium: Dockerized Builds
For isolation and reproducibility:
1. Build Image: Use a base image (e.g., `node:lts` or language-specific). Embed common tooling and cacheable layers for faster installs.
2. Mount Repo: `docker run --rm -v $(pwd)/cloned-repo/<id>:/workspace -w /workspace <build-image> <packageInstallerCommand>` then `<buildCommand>`.
3. Output Handling: Ensure `outputDir` is within the mounted workspace; hand off to `/upload-build` to push to S3.
4. Security: Run containers with non-root users where possible; limit network if needed; apply per-tenant images for strict isolation.

## Premium: Dockerized Deployment on VPS
VPS agents pull artifacts from S3 and run them inside containers:
1. Download: Agent fetches `s3://<BUCKET_NAME>/<repoId>/<artifact>` to a temp dir.
2. Runtime Image: Choose runtime (e.g., `nginx` for static, `node:lts` for SSR). Copy or volume-mount artifact into the container.
3. Start: Use `startCommand` returned by `/build-repo` to launch the app inside the container.
4. Health & Rollback: Add health checks; keep previous artifact to enable rollback on failure.
5. Security: Use distinct IAM credentials per agent; restrict S3 access by prefix (`<repoId>/`).

## Operational Notes
- Repo size limit: 100 MB (via GitHub API in [`checkSize`](src/utils/checkSize.ts)).
- Error handling: Build/install errors captured from stderr; status codes via [`types/StatusCode`](src/types/types.ts).
- Auth: Tokens verified with [`verifyAccessToken`](src/jwt/verifyTokens.ts); ensure `ACCESS_TOKEN_SECRET` is configured.
- S3 keys: Stored under repoId prefix to avoid collisions.

## Next Steps
- Add containerized build runner abstraction (per premium policy).
- Add artifact integrity checks (hashing) before deploy.
- Add tests and CI.