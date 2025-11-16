FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY shared ./shared
RUN npm install --prefix shared --omit=dev

COPY services/inventory-service/package*.json ./services/inventory-service/
RUN npm install --prefix services/inventory-service --omit=dev

COPY services/inventory-service ./services/inventory-service

WORKDIR /app/services/inventory-service
EXPOSE 5005
CMD ["node", "server.js"]
