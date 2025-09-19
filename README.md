# Pizza App – деплой (frontend + backend)

Данная ветка делалась в качестве объединения двух отдельных веток для бэкенда и фронтенда. Они были совмещены, структура проекта подогнана под корректный вид.

Добавлена возможность поднять фронт, бэкенд и базу данных одной командой.

## Что внутри
- web: React + Vite, сборка через Nginx
- api: ASP.NET Core (.NET 8)
- db: PostgreSQL 17, подгрузка из дампа

Структура:
- `pizza-app-frontend/` — фронтенд
- `PizzaWebApp/` — бэкенд
- `db/` — дамп БД и файл восстановления

## Запуск
Из папки `deploy`:
```bash
docker compose up -d --build
```
Проверка, по умолчанию:
- API: http://localhost:8080/api/health

Если нужно восстановить БД:
```bash
docker compose down -v
docker compose up -d db
```

# Адреса
- Фронтенд берёт адрес API из `VITE_API_URL` во время сборки.
- По умолчанию в `docker-compose.yml`: `http://localhost:8080/api`.

# Пересборка только фронт
```bash
docker compose build web
docker compose up -d web
```

# Дамп БД
- Используется PostgreSQL 17 (формат дампа).
- `db/init.sh` сначала пытается `pg_restore` (`pizza_dump.sql` — дамп), если не вышло — обратно на `psql` для plain SQL.

# Остановить всё
```bash
docker compose down
```

# Полностью снести со всеми данными
```bash
docker compose down -v
```

## Планы:
- Подогнать dev под текущую структуру проекта.
- Развести dev/prod конфиги докера.
- Пересмотреть хранение переменных окружения.
- Рассмотреть переход под один реверс-прокси.
- Пересмотреть логику подгрузки дампа.
