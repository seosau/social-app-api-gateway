# backend/Dockerfile
FROM node:20-alpine
# FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=./src/config/database/prisma/schema.prisma
RUN npm run build

RUN apk add --no-cache graphicsmagick

# EXPOSE 4000

CMD ["npm", "run", "start"]
