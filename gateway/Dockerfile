FROM node:18
WORKDIR /app

# Copy gateway and shared libs so we can import from ../shared
COPY gateway/package*.json ./gateway/
COPY shared ./shared
COPY gateway ./gateway

WORKDIR /app/gateway
RUN npm install --production

EXPOSE 3000
CMD node server.js
