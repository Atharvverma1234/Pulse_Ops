#!/bin/bash
# PulseOps Production Deployment Script
set -e  # exit on any error

echo "========================================"
echo "  PulseOps Production Deployment"
echo "========================================"

# ── Config ────────────────────────────────────
PROJECT_DIR="/opt/pulseops"
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="/var/log/pulseops-deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ── Pre-flight checks ─────────────────────────
log "Running pre-flight checks..."

if ! command -v docker &> /dev/null; then
  log "ERROR: Docker not installed"
  exit 1
fi

if ! command -v docker compose &> /dev/null; then
  log "ERROR: Docker Compose not installed"
  exit 1
fi

if [ ! -f "$PROJECT_DIR/backend/.env.production" ]; then
  log "ERROR: backend/.env.production not found"
  exit 1
fi

log "Pre-flight checks passed"

# ── Pull latest code ──────────────────────────
log "Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# ── Build images ──────────────────────────────
log "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache

# ── Stop old containers ───────────────────────
log "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans

# ── Start new containers ──────────────────────
log "Starting containers..."
docker compose -f "$COMPOSE_FILE" up -d

# ── Wait for health checks ────────────────────
log "Waiting for services to become healthy..."
sleep 15

# ── Verify each service ───────────────────────
check_service() {
  local name=$1
  local url=$2
  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$response" = "200" ]; then
    log "✓ $name is healthy ($response)"
    return 0
  else
    log "✗ $name may have issues ($response)"
    return 1
  fi
}

check_service "Nginx"      "http://localhost:80/nginx-health"
check_service "Backend"    "http://localhost:80/api/health"
check_service "AI Service" "http://localhost:80/ai-api/health"

# ── Show running containers ───────────────────
log "Running containers:"
docker compose -f "$COMPOSE_FILE" ps

# ── Clean up old images ───────────────────────
log "Cleaning up dangling images..."
docker image prune -f

log "========================================"
log "  Deployment complete!"
log "========================================"