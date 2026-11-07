# Stage 1: compile the React/Vite application
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Empty value means the browser uses same-origin /api and /images routes.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: serve only static production assets with an unprivileged Nginx image
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080
