FROM node:20-bullseye
WORKDIR /app
COPY package*.json ./
RUN rm -f package-lock.json && npm cache clean --force
RUN npm install --include=dev


COPY . .

RUN npm rebuild rollup --force || true
# RUN npm install -g vite
EXPOSE 5173
CMD ["npm", "run", "dev"]