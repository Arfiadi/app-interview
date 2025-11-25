# --- Stage 1: Dependencies ---
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- Stage 2: Builder ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Non-aktifkan telemetri Next.js saat build
ENV NEXT_TELEMETRY_DISABLED=1

# Build aplikasi Next.js
RUN npm run build

# --- Stage 3: Runner (Production Image) ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin file yang diperlukan dari stage builder
# Kita menggunakan mode 'standalone' output Next.js untuk efisiensi
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Pindah ke user non-root
USER nextjs

EXPOSE 3001

ENV PORT=3001
# Host harus 0.0.0.0 di dalam Docker
ENV HOSTNAME="0.0.0.0" 

CMD ["node", "server.js"]