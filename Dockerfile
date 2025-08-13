FROM hub.nexdev.net/base/node:24-alpine-25h2 AS client-builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Set production environment
ENV NODE_ENV=local

EXPOSE 5000

CMD ["npm", "run", "start:local"]
