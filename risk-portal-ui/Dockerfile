# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time env vars (Vite bakes these into the bundle)
ARG VITE_AGENT_URL=http://localhost:8000
ARG VITE_SERVER_URL=
ARG VITE_APP_NAME=metronic-tailwind-react
ARG VITE_APP_VERSION=9.1.0

ENV VITE_AGENT_URL=$VITE_AGENT_URL \
    VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_VERSION=$VITE_APP_VERSION

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Serve
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
