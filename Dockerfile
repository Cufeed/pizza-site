FROM node:20-alpine AS builder
WORKDIR /app

COPY ["PizzaWebFront 2.1/pizza-app-frontend/package*.json", "./"]
RUN npm ci
COPY ["PizzaWebFront 2.1/pizza-app-frontend/", "./"]
RUN npm run build

FROM nginx:stable-alpine AS final
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'OK' > /usr/share/nginx/html/health

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 