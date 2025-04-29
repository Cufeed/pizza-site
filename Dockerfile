FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

RUN mkdir -p /app/dist

# Создаем простой тестовый сайт
RUN echo '<!DOCTYPE html><html><head><title>Pizza App</title></head><body><h1>Pizza App</h1><p>Site works!</p></body></html>' > /app/dist/index.html
RUN echo '<!DOCTYPE html><html><head><title>Health</title></head><body>OK</body></html>' > /app/dist/health.html
RUN echo '<!DOCTYPE html><html><head><title>Health</title></head><body>OK</body></html>' > /app/dist/health

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"] 