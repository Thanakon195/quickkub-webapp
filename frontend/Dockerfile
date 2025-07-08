# ========================================
# QuickKub Frontend Dockerfile
# ========================================

# Use Node.js 20 Bullseye as base image
FROM node:20-bullseye AS base

# Install dependencies only when needed
FROM node:20-bullseye AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Development image
FROM node:20-bullseye AS runner
WORKDIR /app

ENV NODE_ENV development

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
