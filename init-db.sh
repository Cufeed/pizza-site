#!/bin/bash

# Включаем подробное логирование
set -x

echo "Запуск скрипта инициализации БД $(date)"

# Проверяем запущен ли сервис PostgreSQL
echo "Проверяем статус PostgreSQL..."
if ! service postgresql status; then
    echo "PostgreSQL не запущен, пробуем запустить..."
    service postgresql start
    sleep 5
fi

# Проверяем, запустился ли PostgreSQL
if ! service postgresql status | grep -q "online\|active"; then
    echo "Ошибка: не удалось запустить PostgreSQL"
    exit 1
fi

echo "PostgreSQL запущен успешно"

# Проверяем, существует ли база данных pizza
echo "Проверяем наличие базы данных pizza..."
if ! su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw pizza"; then
    echo "База данных pizza не существует, создаем..."
    
    # Устанавливаем пароль для пользователя postgres
    echo "Устанавливаем пароль для пользователя postgres..."
    su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '123';\"" || { echo "Ошибка при установке пароля для postgres"; }
    
    # Создаем базу данных
    echo "Создаем базу данных pizza..."
    su - postgres -c "createdb -O postgres pizza" || { echo "Ошибка при создании базы данных pizza"; exit 1; }
    
    # Импортируем данные из дампа
    echo "Импортируем данные из дампа..."
    if [ -f "/docker-entrypoint-initdb.d/pizza_dump.sql" ]; then
        su - postgres -c "psql -d pizza -f /docker-entrypoint-initdb.d/pizza_dump.sql" || { echo "Ошибка при импорте данных"; exit 1; }
        echo "Импорт данных выполнен успешно"
    else
        echo "Ошибка: файл дампа не найден в /docker-entrypoint-initdb.d/pizza_dump.sql"
        exit 1
    fi
    
    echo "База данных инициализирована успешно"
else
    echo "База данных pizza уже существует"
fi

# Создаем файл-маркер успешной инициализации
touch /tmp/db_initialized
echo "Инициализация БД завершена успешно $(date)"

exit 0 