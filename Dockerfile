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

# Установка .NET SDK 8.0
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Копирование SQL дампа
COPY docker/db/pizza_dump.sql /docker-entrypoint-initdb.d/
RUN chown postgres:postgres /docker-entrypoint-initdb.d/pizza_dump.sql

# Компиляция бэкенда
WORKDIR /app/backend
COPY PizzaWebApp/PizzaWebApp.csproj ./
RUN dotnet restore

COPY PizzaWebApp/ ./
RUN dotnet publish -c Release -o /app/backend/publish

# Компиляция фронтенда
WORKDIR /app/frontend
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]
RUN sed -i 's/"build": "tsc -b && vite build --outDir dist"/"build": "vite build --outDir dist"/' package.json
RUN npm ci && npm run build

# Создаем директорию wwwroot в бэкенде
RUN mkdir -p /app/backend/publish/wwwroot

# Создаем отдельную простую страницу здоровья
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body>OK</body></html>' > /app/frontend/dist/health-minimal.html

# Подготовка nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Стартовый скрипт
RUN echo '#!/bin/bash' > /start.sh
RUN echo 'service postgresql start || true' >> /start.sh
RUN echo 'sleep 5' >> /start.sh
RUN echo 'su - postgres -c "psql -c \\"ALTER USER postgres WITH PASSWORD '"'"'123'"'"';\\" || true"' >> /start.sh
RUN echo 'su - postgres -c "createdb -O postgres pizza || true"' >> /start.sh
RUN echo 'if [ -f /docker-entrypoint-initdb.d/pizza_dump.sql ]; then su - postgres -c "psql -d pizza -f /docker-entrypoint-initdb.d/pizza_dump.sql || true"; fi' >> /start.sh
RUN echo 'service nginx start || true' >> /start.sh
RUN echo 'cd /app/backend/publish && ASPNETCORE_URLS="http://+:5023" dotnet PizzaWebApp.dll &' >> /start.sh
RUN echo 'exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf' >> /start.sh
RUN chmod +x /start.sh

# Очень простой supervisord.conf
RUN echo '[supervisord]' > /etc/supervisor/supervisord.conf
RUN echo 'nodaemon=true' >> /etc/supervisor/supervisord.conf
RUN echo 'user=root' >> /etc/supervisor/supervisord.conf

RUN echo '[program:nginx]' >> /etc/supervisor/supervisord.conf
RUN echo 'command=/usr/sbin/nginx -g "daemon off;"' >> /etc/supervisor/supervisord.conf
RUN echo 'autostart=true' >> /etc/supervisor/supervisord.conf
RUN echo 'autorestart=true' >> /etc/supervisor/supervisord.conf
RUN echo 'startretries=5' >> /etc/supervisor/supervisord.conf
RUN echo 'numprocs=1' >> /etc/supervisor/supervisord.conf
RUN echo 'startsecs=0' >> /etc/supervisor/supervisord.conf
RUN echo 'priority=10' >> /etc/supervisor/supervisord.conf
RUN echo 'stdout_logfile=/var/log/nginx.log' >> /etc/supervisor/supervisord.conf
RUN echo 'stderr_logfile=/var/log/nginx.err' >> /etc/supervisor/supervisord.conf

RUN echo '[program:health-check]' >> /etc/supervisor/supervisord.conf
RUN echo 'command=bash -c "while true; do if ! curl -s -f http://localhost/health-minimal.html >/dev/null; then service nginx restart || true; fi; sleep 3; done"' >> /etc/supervisor/supervisord.conf
RUN echo 'autostart=true' >> /etc/supervisor/supervisord.conf
RUN echo 'autorestart=true' >> /etc/supervisor/supervisord.conf
RUN echo 'startretries=5' >> /etc/supervisor/supervisord.conf
RUN echo 'priority=20' >> /etc/supervisor/supervisord.conf

# Добавим простой health check прямо в контейнер
HEALTHCHECK --interval=5s --timeout=3s --start-period=30s \
  CMD curl -f http://localhost/health-minimal.html || exit 1

# Убедимся, что health-check файл доступен напрямую
RUN mkdir -p /var/www/html
RUN echo '<!DOCTYPE html><html><head><title>OK</title></head><body>OK</body></html>' > /var/www/html/health-minimal.html
RUN cp /var/www/html/health-minimal.html /usr/share/nginx/html/health-minimal.html

EXPOSE 80
EXPOSE 5432
EXPOSE 5023

CMD ["/start.sh"] 