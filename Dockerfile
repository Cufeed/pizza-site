FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

# Установка зависимостей
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    postgresql \
    postgresql-contrib \
    libpq-dev \
    nginx \
    net-tools \
    netcat \
    curl \
    supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Настройка PostgreSQL
RUN /etc/init.d/postgresql start && \
    su - postgres -c "psql -c \"CREATE USER pizza WITH PASSWORD 'pizzapass';\"" && \
    su - postgres -c "psql -c \"CREATE DATABASE pizza OWNER pizza;\"" && \
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pizza TO pizza;\""

# Конфигурация postgres
RUN echo "listen_addresses = '*'" >> /etc/postgresql/14/main/postgresql.conf && \
    echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/14/main/pg_hba.conf

# Создание рабочей директории
WORKDIR /app

# Копирование файлов проекта
COPY . /app/

# Установка зависимостей Python
RUN pip3 install -r requirements.txt

# Создание базовой страницы для health check
RUN mkdir -p /app/frontend/dist && \
    echo "<html><body><h1>OK</h1></body></html>" > /app/frontend/dist/health-minimal.html

# Настройка Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Конфигурация Supervisor
RUN mkdir -p /var/log/supervisor
COPY supervisor.conf /etc/supervisor/conf.d/app.conf

# Создание скрипта для запуска
RUN echo '#!/bin/bash\n\
# Запуск postgres\n\
service postgresql start\n\
sleep 2\n\
\n\
# Запуск supervisor\n\
/usr/bin/supervisord -n\n' > /start.sh && \
chmod +x /start.sh

# Создание скрипта для проверки здоровья
RUN echo '#!/bin/bash\n\
if ! curl -s http://localhost/health-minimal.html | grep -q "OK"; then\n\
    echo "Health check failed: Nginx not responding"\n\
    exit 1\n\
fi\n\
\n\
if ! nc -z localhost 8000; then\n\
    echo "Health check failed: Backend not responding"\n\
    exit 1\n\
fi\n\
\n\
echo "Health check passed"\n\
exit 0\n' > /healthcheck.sh && \
chmod +x /healthcheck.sh

EXPOSE 80
EXPOSE 5432

CMD ["/start.sh"] 