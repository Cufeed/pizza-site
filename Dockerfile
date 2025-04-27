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
    && rm -rf /var/lib/apt/lists/*

# Установка .NET SDK
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y dotnet-sdk-7.0 \
    && rm -rf /var/lib/apt/lists/*

# Установка Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Настройка PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER postgres WITH SUPERUSER PASSWORD '123';" && \
    createdb -O postgres pizza
USER root

# Копирование SQL дампа
COPY docker/db/pizza_dump.sql /tmp/
RUN chown postgres:postgres /tmp/pizza_dump.sql
USER postgres
RUN /etc/init.d/postgresql start && \
    psql -d pizza -f /tmp/pizza_dump.sql
USER root

# Компиляция бэкенда
WORKDIR /app/backend
COPY PizzaWebApp/ ./
RUN dotnet publish -c Release -o /app/backend/publish

# Компиляция фронтенда
WORKDIR /app/frontend
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]
RUN npm ci && npm run build

# Настройка Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/sites-enabled/default || true

# Настройка Supervisor для запуска всех сервисов
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80
EXPOSE 5023

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 