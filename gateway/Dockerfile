FROM node:18-alpine
WORKDIR /app

# Copy gateway and shared libs so we can import from ../shared
COPY gateway/package*.json ./gateway/
COPY shared ./shared
COPY gateway ./gateway

WORKDIR /app/gateway
RUN npm install --production

EXPOSE 8080
CMD ["node", "server.js"]
