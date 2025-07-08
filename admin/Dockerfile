# Admin Panel Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
