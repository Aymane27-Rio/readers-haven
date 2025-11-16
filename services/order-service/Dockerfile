FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY shared ./shared
RUN npm install --prefix shared --omit=dev

COPY services/order-service/package*.json ./services/order-service/
RUN npm install --prefix services/order-service --omit=dev

COPY services/order-service ./services/order-service

WORKDIR /app/services/order-service
EXPOSE 5004
CMD ["node", "server.js"]
