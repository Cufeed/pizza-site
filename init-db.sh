#!/bin/bash
set -e

# Запуск PostgreSQL
service postgresql start

# Даем PostgreSQL время на запуск
sleep 5

# Проверка, существует ли уже база данных pizza
if ! su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw pizza"; then
  echo "Создание базы данных pizza..."
  su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '123';\""
  su - postgres -c "createdb -O postgres pizza"
  
  # Импорт данных из дампа
  echo "Импорт данных из дампа..."
  su - postgres -c "psql -d pizza -f /docker-entrypoint-initdb.d/pizza_dump.sql"
  echo "База данных инициализирована."
else
  echo "База данных pizza уже существует."
fi 