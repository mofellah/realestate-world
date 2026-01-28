# =========================================
# Stage 1: Build Stage
# =========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/

# Install dependencies
RUN npm ci --workspace=apps/frontend --include-workspace-root

# Copy source code
COPY apps/frontend/ ./apps/frontend/
COPY packages/types ./packages/types
COPY packages/config ./packages/config

# Build Vite application for production
RUN npm run build --workspace=@boilerplate/frontend

# =========================================
# Stage 2: Runtime Stage (Nginx)
# =========================================
FROM nginx:1.25-alpine AS runtime

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY ops/docker/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Expose port 8080 (not 80 to allow running without root if needed)
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
