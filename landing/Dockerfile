# Landing Page Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3004
CMD ["npm", "start"]
