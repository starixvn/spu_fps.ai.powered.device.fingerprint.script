FROM hub.nexdev.net/base/node:24-alpine-25h2 AS client-builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server/index.js"]
