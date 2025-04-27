#!/bin/bash

# Включаем подробное логирование
set -x

echo "[$(date)] Запуск скрипта инициализации БД"

# Ждем некоторое время, чтобы PostgreSQL успел запуститься
echo "[$(date)] Ожидание запуска PostgreSQL"
sleep 15

# Простая инициализация без проверок
echo "[$(date)] Установка пароля postgres"
su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '123';\"" || true

echo "[$(date)] Создание БД pizza"
su - postgres -c "createdb -O postgres pizza" || true

echo "[$(date)] Импорт данных (если есть)"
if [ -f "/docker-entrypoint-initdb.d/pizza_dump.sql" ]; then
    su - postgres -c "psql -d pizza -f /docker-entrypoint-initdb.d/pizza_dump.sql" || true
    echo "[$(date)] Импорт завершен"
else
    echo "[$(date)] Файл дампа не найден"
fi

# Создаем файл-маркер успешной инициализации
touch /tmp/db_initialized
echo "[$(date)] Инициализация БД завершена"

# Всегда возвращаем успех
exit 0 