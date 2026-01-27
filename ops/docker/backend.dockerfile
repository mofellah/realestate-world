# Stage 1: Build (Debian-based for OpenSSL 1.1 compat needed by Prisma)
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install build dependencies and OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    dumb-init \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/ ./packages/
COPY tsconfig.json ./
COPY apps/backend/ ./apps/backend/

# Install dependencies
RUN npm ci

# Copy Prisma schema for client generation
COPY db/ ./db/

# Generate Prisma client (uses schema in /app/db)
RUN npx --prefix apps/backend prisma generate --schema=/app/db/schema.prisma

# Build backend
RUN npm run build --workspace=@boilerplate/backend

# Stage 2: Runtime (Debian-based for OpenSSL compatibility)
FROM node:20-bookworm-slim
WORKDIR /app

# Install runtime deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    dumb-init \
    openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy node_modules and built code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist/apps/backend/src ./src
COPY --from=builder /app/apps/backend/dist/apps/backend/tsconfig.tsbuildinfo ./
COPY --from=builder /app/packages ./packages

# Copy only necessary package files for runtime
COPY --from=builder /app/apps/backend/package*.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run app
ENTRYPOINT ["dumb-init", "node"]
CMD ["src/main.js"]
