# Nginx Reverse Proxy Dockerfile
FROM nginx:1.25-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy configuration will be handled by volume mount
# in docker-compose.prod.yml

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
