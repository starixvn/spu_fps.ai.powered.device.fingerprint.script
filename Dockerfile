# Multi-stage Dockerfile for FPS Fingerprint Application
FROM hub.nexdev.net/base/node:24-alpine-25h2 AS base

ARG TRANSFORM_CONFIG

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=$TRANSFORM_CONFIG

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "start"]
