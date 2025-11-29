# ============================================================================
# XRPL Impact Fund - Frontend Dockerfile
# ============================================================================

FROM node:20-alpine AS base

WORKDIR /app

# ============================================================================
# Dependencies Stage
# ============================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# ============================================================================
# Build Stage
# ============================================================================
FROM base AS build

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build for production
RUN npm run build

# ============================================================================
# Production Stage (Nginx)
# ============================================================================
FROM nginx:alpine AS production

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Development Stage
# ============================================================================
FROM base AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start in development mode with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
