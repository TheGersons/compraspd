FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm db:generate && pnpm build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY prisma ./prisma
EXPOSE 3001
CMD ["pnpm","start:prod"]
