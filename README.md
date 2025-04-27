# Pizza Web Docker

Этот репозиторий содержит полное приложение для пиццерии с фронтендом, бэкендом и базой данных, настроенное для запуска в Docker.

## Структура проекта

- `PizzaWebApp/` - Бэкенд на ASP.NET Core
- `PizzaWebFront 2.1/pizza-app-frontend/` - Фронтенд на React
- `docker/db/` - Папка с дампом базы данных
- `docker-compose.yml` - Конфигурация для запуска всех компонентов
- `Dockerfile.backend` - Сборка образа бэкенда
- `Dockerfile.frontend` - Сборка образа фронтенда
- `nginx.conf` - Конфигурация Nginx для фронтенда

## Предварительные условия

- Установленный [Docker](https://www.docker.com/get-started)
- Установленный [Docker Compose](https://docs.docker.com/compose/install/) (обычно идет с Docker Desktop)

## Подготовка

1. Убедитесь, что у вас есть дамп базы данных в папке `docker/db/pizza_dump.sql`.
2. Если папка не существует, создайте ее:

```bash
mkdir -p docker/db
```

3. Создайте дамп базы данных PostgreSQL и поместите его в папку `docker/db`:

```bash
pg_dump -U postgres -h localhost -p 5432 -d pizza > docker/db/pizza_dump.sql
```

## Запуск приложения

1. Соберите и запустите все контейнеры:

```bash
docker-compose up -d
```

2. После запуска приложение будет доступно по адресам:
   - Фронтенд: [http://localhost](http://localhost)
   - API: [http://localhost:5023/api](http://localhost:5023/api)
   - Swagger: [http://localhost:5023/swagger](http://localhost:5023/swagger)

## Развертывание на облачной платформе

Для развертывания на облачной платформе, поддерживающей Docker (например, Railway, Fly.io):

1. Создайте репозиторий на GitHub и загрузите все файлы проекта.
2. Зарегистрируйтесь на выбранной платформе.
3. Подключите ваш GitHub репозиторий к платформе.
4. Настройте переменные окружения, если требуется.
5. Запустите деплой.

### Railway.app (бесплатный уровень)

1. Зарегистрируйтесь на [Railway](https://railway.app/)
2. Создайте новый проект
3. Выберите "Deploy from GitHub repo"
4. Подключите ваш репозиторий
5. Railway автоматически обнаружит `docker-compose.yml` и развернет приложение

## Устранение неполадок

Если приложение не запускается:

1. Проверьте логи контейнеров:

```bash
docker-compose logs
```

2. Проверьте статус контейнеров:

```bash
docker-compose ps
```

3. Перезапустите контейнеры:

```bash
docker-compose down
docker-compose up -d
``` 