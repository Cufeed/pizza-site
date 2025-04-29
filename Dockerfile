FROM node:20-alpine AS build
WORKDIR /app

# Копируем package.json и package-lock.json
COPY ["PizzaWebFront 2.1/pizza-app-frontend/package*.json", "./"]
RUN npm ci

# Копируем исходный код
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]

# Создаем .env файл с API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Собираем проект
RUN npm run build

# Nginx для раздачи статики
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Копируем собранные файлы
COPY --from=build /app/dist/ .

# Создаем health check файл
RUN echo '<!DOCTYPE html><html><head><title>Health</title></head><body>OK</body></html>' > health.html
RUN echo '<!DOCTYPE html><html><head><title>Health</title></head><body>OK</body></html>' > health

# Создаем конфигурацию nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Health check endpoints с максимальным приоритетом \
    location = /health { \
        add_header Content-Type text/html; \
        return 200 "OK"; \
        access_log off; \
    } \
    \
    location = /health.html { \
        add_header Content-Type text/html; \
        return 200 "OK"; \
        access_log off; \
    } \
    \
    # Проверим наличие файла, а затем перенаправим на индекс \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 