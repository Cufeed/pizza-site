FROM node:20-alpine AS builder
WORKDIR /app

COPY ["PizzaWebFront 2.1/pizza-app-frontend/package*.json", "./"]
RUN npm ci
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist

# Создаем файл сервера
RUN echo 'const express = require("express");' > server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo 'app.use(express.static(path.join(__dirname, "dist")));' >> server.js && \
    echo 'app.get("/health", (req, res) => { res.send("OK"); });' >> server.js && \
    echo 'app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "dist", "index.html")); });' >> server.js && \
    echo 'const PORT = process.env.PORT || 80;' >> server.js && \
    echo 'app.listen(PORT, () => console.log(`Server running on port ${PORT}`));' >> server.js

# Устанавливаем Express
RUN npm init -y && npm install express

EXPOSE 80
CMD ["node", "server.js"] 