#!/bin/bash

# Скрипт для мониторинга работоспособности приложения и обновления status.html

# Путь к файлу health.html
HEALTH_FILE="/app/frontend/dist/health.html"

# Функция для обновления статуса
update_status() {
    local status=$1
    local message=$2
    local color=$3
    
    cat > "$HEALTH_FILE" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Health Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .status { padding: 20px; border-radius: 5px; display: inline-block; }
        .ok { background-color: #dff0d8; color: #3c763d; }
        .warning { background-color: #fcf8e3; color: #8a6d3b; }
        .error { background-color: #f2dede; color: #a94442; }
    </style>
    <meta http-equiv="refresh" content="5">
</head>
<body>
    <h1>Application Health Status</h1>
    <div class="status ${color}">
        <h2>${status}</h2>
        <p>${message}</p>
        <p>Last updated: $(date)</p>
    </div>
</body>
</html>
EOF
}

# Бесконечный цикл мониторинга
while true; do
    # Проверка PostgreSQL
    if ! service postgresql status > /dev/null 2>&1; then
        update_status "WARNING" "PostgreSQL service is not running" "warning"
        sleep 5
        continue
    fi
    
    # Проверка Nginx
    if ! service nginx status > /dev/null 2>&1; then
        update_status "WARNING" "Nginx service is not running" "warning"
        sleep 5
        continue
    fi
    
    # Проверка API доступности (через Nginx)
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:80/api/health | grep -q "200"; then
        update_status "WARNING" "API health check failed" "warning"
        sleep 5
        continue
    fi
    
    # Если все проверки пройдены, обновляем статус как OK
    update_status "OK" "All services are running properly" "ok"
    
    # Пауза перед следующей проверкой
    sleep 10
done 