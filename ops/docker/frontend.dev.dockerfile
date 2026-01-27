# Dev Dockerfile: Serve React with Vite dev server and HMR
FROM node:20-bookworm-slim
WORKDIR /app

# Copy root files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/types/package*.json ./packages/types/
COPY packages/config/package*.json ./packages/config/

# Install all dependencies
RUN npm ci

# Copy source code
COPY apps/frontend/ ./apps/frontend/
COPY packages/types/ ./packages/types/
COPY packages/config/ ./packages/config/

EXPOSE 5173

# Bind Vite dev server to all interfaces for Docker publish
CMD ["npm", "run", "dev", "--workspace=@boilerplate/frontend", "--", "--host", "0.0.0.0", "--port", "5173"]
