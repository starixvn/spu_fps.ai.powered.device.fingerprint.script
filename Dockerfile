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

# Development stage
FROM base AS development
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start:development"]

# Local stage  
FROM base AS local
ENV NODE_ENV=local
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "start:local"]

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "start:production"]
