FROM node:20

WORKDIR /app
ENV NODE_ENV=production

# Copy and install shared observability utilities
COPY shared ./shared
RUN npm install --prefix shared --omit=dev

# Install service production dependencies (resolves file: ../../shared)
COPY services/auth-service/package*.json ./services/auth-service/
RUN npm install --prefix services/auth-service --omit=dev

# Copy service source
COPY services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service
EXPOSE 5000
CMD ["npm", "start"]