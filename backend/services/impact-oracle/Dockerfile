FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3300

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3300/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the service
CMD ["npm", "start"]
