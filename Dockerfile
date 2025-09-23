# syntax=docker/dockerfile:1.5

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./package.json
CMD ["node", "dist/index.js"]
