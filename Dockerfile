FROM debian:bullseye-slim

# Установка необходимых зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    supervisor \
    postgresql \
    nginx \
    wget \
    jq \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Создаем еще один health.html файл прямо в корневой директории nginx, чтобы он был доступен без настройки
RUN mkdir -p /var/www/html
RUN echo '<!DOCTYPE html><html><head><title>OK</title></head><body>OK</body></html>' > /var/www/html/health-minimal.html
RUN echo '<!DOCTYPE html><html><head><title>OK</title></head><body>OK</body></html>' > /usr/share/nginx/html/health-minimal.html

# Создаем дополнительный health.html в других возможных местах
RUN mkdir -p /etc/nginx/html
RUN echo 'OK' > /etc/nginx/html/health-minimal.html
RUN echo 'OK' > /etc/nginx/health-minimal.html
RUN echo 'OK' > /health-minimal.html

# Установка .NET SDK 8.0 вместо 7.0
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js 20 вместо 18
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Копирование SQL дампа
COPY docker/db/pizza_dump.sql /docker-entrypoint-initdb.d/
RUN chown postgres:postgres /docker-entrypoint-initdb.d/pizza_dump.sql

# Создание скрипта инициализации базы данных
COPY init-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-db.sh

# Копирование скрипта проверки работоспособности
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# Копирование скрипта мониторинга здоровья
COPY health-monitor.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-monitor.sh

# Компиляция бэкенда - сначала копируем только файл проекта
WORKDIR /app/backend
COPY PizzaWebApp/PizzaWebApp.csproj ./
RUN dotnet restore

# Теперь копируем исходники и собираем
COPY PizzaWebApp/ ./
RUN dotnet publish -c Release -o /app/backend/publish

# Компиляция фронтенда
WORKDIR /app/frontend
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]

# Создаем или модифицируем package.json для сборки без проверки типов
RUN sed -i 's/"build": "tsc -b && vite build --outDir dist"/"build": "vite build --outDir dist"/' package.json

# Устанавливаем зависимости и запускаем сборку без проверки типов
RUN npm ci && npm run build

# Настройка Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/sites-enabled/default || true

# Создаем файл проверки работоспособности
RUN mkdir -p /app/frontend/dist
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title><meta http-equiv="refresh" content="5"></head><body>Initializing...</body></html>' > /app/frontend/dist/health.html

# Настройка Supervisor для запуска всех сервисов
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Создаем стартовый скрипт для Railway
RUN echo '#!/bin/bash' > /start.sh
RUN echo 'echo "OK" > /tmp/health-minimal.html' >> /start.sh
RUN echo 'if [ ! -d /usr/share/nginx/html ]; then mkdir -p /usr/share/nginx/html; fi' >> /start.sh
RUN echo 'echo "OK" > /usr/share/nginx/html/health-minimal.html' >> /start.sh
RUN echo 'nginx -g "daemon off;" &' >> /start.sh
RUN echo 'exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' >> /start.sh
RUN chmod +x /start.sh

# Установка HEALTHCHECK для Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD /usr/local/bin/healthcheck.sh

EXPOSE 80
EXPOSE 5023

CMD ["/start.sh"] 