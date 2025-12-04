version: '3.8'

services:
  backend:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    command: sh -c "npm ci && node src/index.js"
    volumes:
      - .:/app
