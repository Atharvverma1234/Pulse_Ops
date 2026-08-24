# PulseOps Windows Deployment Script
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  PulseOps Production Deployment"         -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

function Log($msg) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$timestamp] $msg"
}

# ── Pre-flight ────────────────────────────────
Log "Running pre-flight checks..."

if (-not (Test-Path "D:\Pulse_Ops\backend\.env.production")) {
  Log "ERROR: backend/.env.production not found"
  exit 1
}

if (-not (Test-Path "D:\Pulse_Ops\ai-service\models\isolation_forest.pkl")) {
  Log "WARNING: AI model not found — run train_model.py first"
}

Log "Pre-flight checks passed"

# ── Navigate to project ───────────────────────
Set-Location D:\Pulse_Ops

# ── Build images ──────────────────────────────
Log "Building production Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
  Log "ERROR: Build failed"
  exit 1
}

# ── Stop old containers ───────────────────────
Log "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans

# ── Start production stack ────────────────────
Log "Starting production stack..."
docker compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -ne 0) {
  Log "ERROR: Failed to start containers"
  exit 1
}

# ── Wait for startup ──────────────────────────
Log "Waiting 20 seconds for services to start..."
Start-Sleep -Seconds 20

# ── Health checks ─────────────────────────────
Log "Running health checks..."

$checks = @(
  @{ name = "Nginx";      url = "http://localhost:80/nginx-health" },
  @{ name = "Backend";    url = "http://localhost:80/api/health"   },
  @{ name = "AI Service"; url = "http://localhost:8000/health"     }
)

foreach ($check in $checks) {
  try {
    $response = Invoke-WebRequest -Uri $check.url -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      Log "✓ $($check.name) is healthy"
    }
  } catch {
    Log "✗ $($check.name) health check failed: $_"
  }
}

# ── Show status ───────────────────────────────
Log "Container status:"
docker compose -f docker-compose.prod.yml ps

# ── Cleanup ───────────────────────────────────
Log "Cleaning up dangling images..."
docker image prune -f

Write-Host "========================================"  -ForegroundColor Green
Write-Host "  Deployment complete!"                    -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "Access PulseOps at: http://localhost" -ForegroundColor Yellow
Write-Host "n8n dashboard at:   http://localhost/n8n" -ForegroundColor Yellow