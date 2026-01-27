# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/frontend/ ./apps/frontend/
COPY packages/types ./packages/types
COPY packages/config ./packages/config

RUN npm ci

RUN npm run build --workspace=@boilerplate/frontend

# Stage 2: Runtime (nginx)
FROM nginx:alpine
COPY ops/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
