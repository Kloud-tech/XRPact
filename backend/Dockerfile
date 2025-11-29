# ============================================================================
# XRPL Impact Fund - Backend API Dockerfile
# ============================================================================

FROM node:20-alpine AS base

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++ curl

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

# Build TypeScript
RUN npm run build

# ============================================================================
# Production Stage
# ============================================================================
FROM base AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/xrpl/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]

# ============================================================================
# Development Stage
# ============================================================================
FROM base AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start in development mode with hot reload
CMD ["npm", "run", "dev"]
