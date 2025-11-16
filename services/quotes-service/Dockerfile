FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY shared ./shared
RUN npm install --prefix shared --omit=dev

COPY services/quotes-service/package*.json ./services/quotes-service/
RUN npm install --prefix services/quotes-service --omit=dev

COPY services/quotes-service ./services/quotes-service

WORKDIR /app/services/quotes-service
EXPOSE 5003
CMD ["node", "server.js"]
