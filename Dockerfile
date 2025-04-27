FROM debian:bullseye-slim

# Установка необходимых зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    supervisor \
    postgresql \
    wget \
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

# Копируем health-check файл в wwwroot бэкенда
RUN mkdir -p /app/backend/publish/wwwroot
RUN echo '<!DOCTYPE html><html><head><title>OK</title></head><body>OK</body></html>' > /app/backend/publish/wwwroot/health-minimal.html

# Компиляция фронтенда
WORKDIR /app/frontend
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]
RUN sed -i 's/"build": "tsc -b && vite build --outDir dist"/"build": "vite build --outDir dist"/' package.json
RUN npm ci && npm run build

# Копируем собранный фронтенд в wwwroot бэкенда
RUN cp -R dist/* /app/backend/publish/wwwroot/

# Стартовый скрипт
RUN echo '#!/bin/bash' > /start.sh
RUN echo 'service postgresql start || true' >> /start.sh
RUN echo 'sleep 5' >> /start.sh
RUN echo 'su - postgres -c "psql -c \\"ALTER USER postgres WITH PASSWORD '"'"'123'"'"';\\" || true"' >> /start.sh
RUN echo 'su - postgres -c "createdb -O postgres pizza || true"' >> /start.sh
RUN echo 'if [ -f /docker-entrypoint-initdb.d/pizza_dump.sql ]; then su - postgres -c "psql -d pizza -f /docker-entrypoint-initdb.d/pizza_dump.sql || true"; fi' >> /start.sh
RUN echo 'cd /app/backend/publish && ASPNETCORE_URLS="http://+:80" dotnet PizzaWebApp.dll' >> /start.sh
RUN chmod +x /start.sh

# Добавим простой health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s \
  CMD curl -f http://localhost/health-minimal.html || exit 1

EXPOSE 80
EXPOSE 5432

CMD ["/start.sh"] 