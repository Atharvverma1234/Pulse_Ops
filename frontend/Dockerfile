# ── Stage 1: Build ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Use npm install instead of npm ci — more forgiving
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]