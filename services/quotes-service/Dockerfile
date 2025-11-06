FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install --production
EXPOSE 5003
CMD ["node", "server.js"]
