# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache git libc6-compat g++ make python3
WORKDIR /app
COPY package.json ./
RUN yarn install

# If using npm with a `package-lock.json` comment out above and use below instead
# COPY package.json package-lock.json ./ 
# RUN npm ci

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
RUN npm install concurrently -g
COPY . .
RUN concurrently --kill-others "npm run hardhat" "npm run deploy"; exit 0

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
RUN apk add --no-cache git libc6-compat g++ make python3
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
RUN npm install concurrently -g

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/scripts/deploy.js ./scripts/deploy.js
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/hardhat.config.ts ./
COPY --from=builder /app/public ./public


# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

EXPOSE 8545

ENV PORT 3000

CMD ["npm", "run", "serve"]