# =========================================
# Stage 1: Build Stage
# =========================================
FROM node:20-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Install build dependencies and OpenSSL (required for Prisma)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Copy package files for all workspaces
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/
COPY db/package*.json ./db/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --include-workspace-root --verbose

# Copy source code
COPY tsconfig.json ./
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/
COPY db/ ./db/

# Generate Prisma client
RUN cd /app && npm run prisma:generate

# Build the backend application
RUN npm run build --workspace=@boilerplate/backend

# =========================================
# Stage 2: Runtime Stage
# =========================================
FROM node:20-bookworm-slim AS runtime

# Set working directory
WORKDIR /app

# Install runtime dependencies (curl for healthcheck, OpenSSL for Prisma)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    curl \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm ci --workspace=apps/backend --omit=dev --include-workspace-root

# Copy built application and dependencies from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/db/schema.prisma ./db/schema.prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose backend port
EXPOSE 3000

# Healthcheck using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run database migrations and start the application
CMD sh -c "npx prisma migrate deploy --schema=./db/schema.prisma && node apps/backend/dist/main.js"
