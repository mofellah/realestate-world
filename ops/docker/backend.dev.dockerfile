# Backend Development Dockerfile
# Runs backend with hot reload using ts-node
# For development use only

FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Install build dependencies and tools
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    python3 \
    build-essential \
    gcc \
    g++ \
    make \
  && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace package files (for npm ci)
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/
COPY db/package*.json ./db/

# Install all dependencies (including devDependencies for development)
# First install root dependencies, then all workspaces
RUN npm ci --include-workspace-root

# Rebuild native modules for Linux
RUN npm rebuild bcrypt --build-from-source

# Copy source code
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/
COPY db/ ./db/

# Generate Prisma client using workspace-scoped prisma binary
RUN cd /app/db && node ./scripts/ensure-prisma-client.js && node_modules/.bin/prisma generate --schema=./schema.prisma

# Expose backend port
EXPOSE 3000

# Health check (lenient for dev - just check if port is open)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run backend in development mode with hot reload
# This is overridden by docker-compose command but serves as a fallback
CMD ["npm", "run", "start:dev", "--workspace=@boilerplate/backend"]
