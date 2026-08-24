# ── Stage 1: Dependencies ─────────────────────
FROM python:3.11-slim AS deps

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Production ───────────────────────
FROM python:3.11-slim AS production

# Create non-root user
RUN groupadd -r aiuser && useradd -r -g aiuser aiuser

WORKDIR /app

# Copy installed packages from deps stage
COPY --from=deps /usr/local/lib/python3.11/site-packages \
     /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy source
COPY --chown=aiuser:aiuser . .

# Create models directory
RUN mkdir -p models data && \
    chown -R aiuser:aiuser models data

USER aiuser

EXPOSE 8000

# Use multiple workers in production
CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--no-access-log"]