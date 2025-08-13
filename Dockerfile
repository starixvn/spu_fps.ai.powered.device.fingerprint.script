# Multi-stage Dockerfile for FPS Fingerprint Application
FROM hub.nexdev.net/base/node:24-alpine-25h2 AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S fpuser -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R fpuser:nodejs /app

# Development stage
FROM base AS development
USER fpuser
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:development"]

# Local stage  
FROM base AS local
USER fpuser
ENV NODE_ENV=local
EXPOSE 5000
CMD ["npm", "run", "start:local"]

# Production stage
FROM base AS production
USER fpuser
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "run", "start:production"]
