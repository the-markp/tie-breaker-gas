# ==========================================
# Stage 1: Build & Bundle
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Copy source code and build production assets & server
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist

# Security: Run as non-root user
USER node

# Expose standard application port
EXPOSE 3000

# Start production server
CMD ["node", "dist/server.js"]
