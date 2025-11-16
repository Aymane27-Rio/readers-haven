FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy shared observability utilities and install their dependencies
COPY shared ./shared
RUN npm install --prefix shared --omit=dev

# Copy service package definition and install prod dependencies (resolves file: ../../shared)
COPY services/books-service/package*.json ./services/books-service/
RUN npm install --prefix services/books-service --omit=dev

# Copy service source
COPY services/books-service ./services/books-service

WORKDIR /app/services/books-service
EXPOSE 5002
CMD ["node", "server.js"]
