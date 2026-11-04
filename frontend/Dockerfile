FROM node:20-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Build (next.config.mjs pakai output: "standalone")
COPY . .
RUN npm run build

# Copy static assets to standalone directory (required by Next.js standalone mode)
RUN cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static

ENV PORT=3000
EXPOSE 3000

# .next/standalone punya server.js sendiri
CMD ["node", ".next/standalone/server.js"]
