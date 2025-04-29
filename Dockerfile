FROM node:20-alpine AS builder
WORKDIR /app

COPY ["PizzaWebFront 2.1/pizza-app-frontend/package*.json", "./"]
RUN npm ci
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]

# Устанавливаем API URL для сборки
ARG VITE_API_URL=https://backend-production-af78.up.railway.app/api
ENV VITE_API_URL=$VITE_API_URL

# Вывод URL для проверки
RUN echo "Building with API URL: $VITE_API_URL"

# Создаем .env файл с явным указанием API URL
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN cat .env

RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist

# Сохраняем информацию об API URL для отладки
RUN echo "VITE_API_URL в сборке: ${VITE_API_URL}" > /app/api-info.txt

# Создаем файл сервера на чистом Node.js без зависимостей
RUN echo 'const http = require("http");' > server.js && \
    echo 'const fs = require("fs");' >> server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const PORT = process.env.PORT || 3000;' >> server.js && \
    echo 'const DIST_DIR = path.join(__dirname, "dist");' >> server.js && \
    echo '' >> server.js && \
    echo 'const MIME_TYPES = {' >> server.js && \
    echo '  ".html": "text/html",' >> server.js && \
    echo '  ".js": "text/javascript",' >> server.js && \
    echo '  ".css": "text/css",' >> server.js && \
    echo '  ".json": "application/json",' >> server.js && \
    echo '  ".png": "image/png",' >> server.js && \
    echo '  ".jpg": "image/jpg",' >> server.js && \
    echo '  ".gif": "image/gif",' >> server.js && \
    echo '  ".svg": "image/svg+xml",' >> server.js && \
    echo '  ".ico": "image/x-icon"' >> server.js && \
    echo '};' >> server.js && \
    echo '' >> server.js && \
    echo 'http.createServer(function(req, res) {' >> server.js && \
    echo '  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);' >> server.js && \
    echo '' >> server.js && \
    echo '  // Обработка health check' >> server.js && \
    echo '  if (req.url === "/health") {' >> server.js && \
    echo '    res.writeHead(200);' >> server.js && \
    echo '    res.end("OK");' >> server.js && \
    echo '    return;' >> server.js && \
    echo '  }' >> server.js && \
    echo '' >> server.js && \
    echo '  // Попытка найти файл' >> server.js && \
    echo '  let filePath = path.join(DIST_DIR, req.url === "/" ? "index.html" : req.url);' >> server.js && \
    echo '  const extname = String(path.extname(filePath)).toLowerCase();' >> server.js && \
    echo '' >> server.js && \
    echo '  // Если файл не существует, возвращаем index.html (для SPA маршрутизации)' >> server.js && \
    echo '  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {' >> server.js && \
    echo '    filePath = path.join(DIST_DIR, "index.html");' >> server.js && \
    echo '  }' >> server.js && \
    echo '' >> server.js && \
    echo '  const contentType = MIME_TYPES[extname] || "application/octet-stream";' >> server.js && \
    echo '' >> server.js && \
    echo '  fs.readFile(filePath, function(error, content) {' >> server.js && \
    echo '    if (error) {' >> server.js && \
    echo '      if (error.code === "ENOENT") {' >> server.js && \
    echo '        res.writeHead(404);' >> server.js && \
    echo '        res.end("File not found");' >> server.js && \
    echo '      } else {' >> server.js && \
    echo '        res.writeHead(500);' >> server.js && \
    echo '        res.end(`Server Error: ${error.code}`);' >> server.js && \
    echo '      }' >> server.js && \
    echo '    } else {' >> server.js && \
    echo '      res.writeHead(200, { "Content-Type": contentType });' >> server.js && \
    echo '      res.end(content, "utf-8");' >> server.js && \
    echo '    }' >> server.js && \
    echo '  });' >> server.js && \
    echo '}).listen(PORT);' >> server.js && \
    echo '' >> server.js && \
    echo 'console.log(`Server running at http://localhost:${PORT}/`);' >> server.js

EXPOSE 3000

CMD ["node", "server.js"] 