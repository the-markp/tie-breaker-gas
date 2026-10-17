# Running The Tiebreaker in Docker

This application is packaged with a multi-stage `Dockerfile` and `docker-compose.yml`.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

## Quick Start (Docker Compose)

1. **Set your API Key** in your terminal or in a `.env` file:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```
   Or create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ```

2. **Build and start the container**:
   ```bash
   docker compose up --build
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Standalone Docker Commands

### 1. Build the Docker Image
```bash
docker build -t the-tiebreaker:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name the-tiebreaker \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  the-tiebreaker:latest
```

### 3. View Logs
```bash
docker logs -f the-tiebreaker
```

### 4. Stop the Container
```bash
docker stop the-tiebreaker
```

---

## Container Architecture
- **Stage 1 (`builder`)**: Uses `node:22-alpine` to install dependencies, compile the React SPA with Vite, and bundle the Express server (`dist/server.js`) via esbuild.
- **Stage 2 (`runner`)**: Minimal `node:22-alpine` production image installing only production dependencies, copying pre-built static assets and server bundles.
- **Security**: Runs under the unprivileged `node` user (non-root).
- **Port**: Serves traffic on port `3000` (customizable via `PORT` environment variable).
