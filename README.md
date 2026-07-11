# GrowEasy Import Platform

## Run locally

1. Copy `.env.example` to `.env` and configure optional OpenAI credentials.
2. Run `npm install` from this folder.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The frontend is Next.js. The Express API validates CSV files, stores completed import runs locally for development, and uses deterministic mapping unless an OpenAI key is configured.
