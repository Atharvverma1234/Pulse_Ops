# PulseOps Stack Health Monitor
# Run this to get a snapshot of all service health

Write-Host ""
Write-Host "PulseOps Stack Health Monitor" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# ── Container status ──────────────────────────
Write-Host "CONTAINERS:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" `
  --filter "name=pulseops"

Write-Host ""

# ── Service health ────────────────────────────
Write-Host "SERVICE HEALTH:" -ForegroundColor Yellow

$services = @(
  @{ name = "Backend";    url = "http://localhost:5000/health"   },
  @{ name = "AI Service"; url = "http://localhost:8000/health"   },
  @{ name = "Nginx";      url = "http://localhost:80/nginx-health" },
  @{ name = "n8n";        url = "http://localhost:5678/healthz"  }
)

foreach ($svc in $services) {
  try {
    $res = Invoke-WebRequest -Uri $svc.url -UseBasicParsing -TimeoutSec 5
    $icon = if ($res.StatusCode -eq 200) { "✓" } else { "✗" }
    $color = if ($res.StatusCode -eq 200) { "Green" } else { "Red" }
    Write-Host "  $icon $($svc.name) — $($res.StatusCode)" -ForegroundColor $color
  } catch {
    Write-Host "  ✗ $($svc.name) — UNREACHABLE" -ForegroundColor Red
  }
}

Write-Host ""

# ── Resource usage ────────────────────────────
Write-Host "RESOURCE USAGE:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" `
  --filter "name=pulseops"

Write-Host ""

# ── Volume usage ──────────────────────────────
Write-Host "VOLUMES:" -ForegroundColor Yellow
docker volume ls --filter "name=pulse_ops"

Write-Host ""

# ── Recent logs (errors only) ─────────────────
Write-Host "RECENT ERRORS (last 5 min):" -ForegroundColor Yellow
$since = (Get-Date).AddMinutes(-5).ToString("yyyy-MM-ddTHH:mm:ss")

$containers = @("pulseops-backend", "pulseops-ai", "pulseops-mongo")
foreach ($c in $containers) {
  $logs = docker logs $c --since $since 2>&1 | `
    Select-String -Pattern "error|Error|ERROR|fail|FAIL" | `
    Select-Object -First 3
  if ($logs) {
    Write-Host "  [$c]:" -ForegroundColor Red
    $logs | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkRed }
  }
}

Write-Host ""
Write-Host "Monitor complete — $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan