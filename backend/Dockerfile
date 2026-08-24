# ── Stage 1: Dependencies ─────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --silent

# ── Stage 2: Production ───────────────────────
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

WORKDIR /app

# Copy only production deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

EXPOSE 5000

# Use node directly — no nodemon in production
CMD ["node", "server.js"]