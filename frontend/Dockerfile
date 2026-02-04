FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --no-frozen-lockfile
COPY . .

# Declarar que aceptamos esta variable
ARG VITE_API_URL

# Convertirla en variable de entorno para que Vite la vea durante el build
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
