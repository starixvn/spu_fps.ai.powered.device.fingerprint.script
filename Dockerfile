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

# Production stage
FROM base AS production
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "run", "start:production"]
