# ── Stage 1: Dependencies ─────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# --omit=dev replaces --only=production in npm 7+
RUN npm ci --omit=dev

# ── Stage 2: Production ───────────────────────
FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

WORKDIR /app

# Copy deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY --chown=nodeuser:nodejs . .

USER nodeuser

EXPOSE 5000

CMD ["node", "server.js"]