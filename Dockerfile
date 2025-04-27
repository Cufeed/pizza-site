FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Бэкенд
COPY ["PizzaWebApp/PizzaWebApp.csproj", "PizzaWebApp/"]
# Фронтенд для статики
COPY ["PizzaWebFront 2.1/pizza-app-frontend/package.json", "PizzaWebFront 2.1/pizza-app-frontend/package-lock.json", "frontend/"]

# Восстанавливаем зависимости
RUN dotnet restore "PizzaWebApp/PizzaWebApp.csproj"
RUN cd frontend && npm ci && npm run build

# Копируем всё и публикуем
COPY ["PizzaWebApp/", "PizzaWebApp/"]
COPY ["PizzaWebFront 2.1/pizza-app-frontend/dist", "PizzaWebApp/wwwroot"]

WORKDIR /src/PizzaWebApp
RUN dotnet publish "PizzaWebApp.csproj" -c Release -o /app/publish

FROM debian:bullseye-slim

# Устанавливаем PostgreSQL и Supervisor
RUN apt-get update && apt-get install -y postgresql supervisor ca-certificates && rm -rf /var/lib/apt/lists/*

# Копируем публикацию
COPY --from=build /app/publish /app

# Копируем init-db скрипт и supervisord.conf
COPY init-db.sh /init-db.sh
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chmod +x /init-db.sh

# Создаем health-файл
RUN mkdir -p /app/wwwroot && echo '<html><body>OK</body></html>' > /app/wwwroot/health-minimal.html

# HEALTHCHECK для Railway
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s \
    CMD curl -f http://localhost/health-minimal.html || exit 1

EXPOSE 80
EXPOSE 5432

CMD ["/usr/bin/supervisord", "-n"] 