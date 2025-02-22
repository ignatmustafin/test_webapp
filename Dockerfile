FROM node:20.17.0-alpine as server_builder

WORKDIR /app

COPY package.json ./
COPY package.*.json ./
COPY src/database/migrations ./dist/database/migrations/.
COPY . .

RUN npm install