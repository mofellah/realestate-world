# Frontend Dev Dockerfile: Serve React with Vite dev server and HMR
FROM node:20-bookworm-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Copy root files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/
COPY packages/logger/package*.json ./packages/logger/
COPY packages/utils/package*.json ./packages/utils/

# Install all dependencies
RUN npm ci --workspace=apps/frontend --include-workspace-root

# Copy source code
COPY apps/frontend/ ./apps/frontend/
COPY packages/types/ ./packages/types/
COPY packages/config/ ./packages/config/
COPY packages/logger/ ./packages/logger/
COPY packages/utils/ ./packages/utils/

# Expose port for Vite dev server
EXPOSE 5173

# Healthcheck - simple TCP check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Bind Vite dev server to all interfaces for Docker networking
# The --host 0.0.0.0 allows connections from outside the container
CMD ["npm", "run", "dev", "--workspace=@boilerplate/frontend", "--", "--host", "0.0.0.0", "--port", "5173"]
