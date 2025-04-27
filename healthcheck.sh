#!/bin/bash
set -e

# Проверка работы PostgreSQL
pg_status=$(service postgresql status | grep "online")
if [ -z "$pg_status" ]; then
    echo "PostgreSQL не запущен"
    exit 1
fi

# Проверка работы Nginx
nginx_status=$(service nginx status | grep "running")
if [ -z "$nginx_status" ]; then
    echo "Nginx не запущен"
    exit 1
fi

# Проверка доступности API бэкенда
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5023/api/health || echo "failed")
if [ "$backend_status" != "200" ]; then
    echo "Backend API не отвечает, статус: $backend_status"
    exit 1
fi

echo "Все сервисы работают нормально"
exit 0 