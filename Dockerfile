# ============================
#   ETAPA 1 — BUILD
# ============================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ============================
#   ETAPA 2 — SERVIDOR NGINX
# ============================
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Remove cache agressivo
RUN sed -i 's/expires 1y/expires 1h/' /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
