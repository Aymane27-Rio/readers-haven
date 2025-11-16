FROM node:18

WORKDIR /app
ENV NODE_ENV=production

# Copy shared observability utilities and install their dependencies
COPY shared ./shared
RUN npm install --prefix shared --omit=dev

# Install gateway production dependencies (resolves file: ../shared)
COPY gateway/package*.json ./gateway/
RUN npm install --prefix gateway --omit=dev

# Copy gateway source
COPY gateway ./gateway

WORKDIR /app/gateway
EXPOSE 3000
CMD ["node", "server.js"]
