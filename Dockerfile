# Production Multi-Stage Dockerfile for Railway Deployment
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package definition and install dependencies
COPY package*.json ./
RUN npm ci

# Copy TypeScript source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production Runner Image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY data/ ./data/

# Railway provides PORT dynamic environment variable (defaults to 8080)
EXPOSE 8080

CMD ["node", "dist/index.js"]
