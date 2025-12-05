FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci --only=production
COPY . .

EXPOSE 5000

CMD ["npm", "start"]