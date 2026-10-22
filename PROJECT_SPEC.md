# Project Specification: Mosaic 1001

## Goal
A zero-login habit tracker and visual mosaic for the "1001 Albums You Must Hear Before You Die" generator project.
- **Visual Core:** All 1,001 albums render in black-and-white (grayscale). As the user listens and rates an album, that specific tile bursts into full color.
- **Workflow:** Daily album fetch, zero authentication (URL slug-based tracking), direct Spotify deep links, and a companion Android home screen widget.

## Architecture & Staged Roadmap
- **Stage 1 (Web Application & Server):**
  - Frontend: React + TypeScript + Vite + Tailwind CSS.
  - Backend: Node.js (Fastify or Express) with SQLite (`better-sqlite3`).
  - External Data: Ingests `https://1001albumsgenerator.com/api/v1/projects/:slug`.
  - Deployment: Docker Compose on Oracle Cloud, routed through Cloudflare to a custom domain.
  - Widget API: Exposes `GET /api/project/:slug/widget` returning a minimal JSON payload for today's album.
- **Stage 2 (Android App & Home Screen Widget):**
  - Android Shell: Capacitor wrapping the Stage 1 web application.
  - Widget: Native Android Jetpack Glance widget hitting the `/api/project/:slug/widget` endpoint.
  - Deep Linking: Fires `spotify:album:<spotifyId>` intents directly to the Spotify app.

## Implementation Principles
- Step-by-step guidance: Explain fundamental concepts (React state, Tailwind utilities, Android intents) clearly before writing code.
- No mock credentials: Rely strictly on public project slugs and deep links.