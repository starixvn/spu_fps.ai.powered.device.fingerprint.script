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

# Staging stage  
FROM base AS staging
ENV NODE_ENV=staging
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "start:staging"]
