FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/src ./src

EXPOSE 8080

CMD ["node", "src/index.js"]
