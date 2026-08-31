FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN sed -i 's|__API_URL__|http://localhost:8080/api/v1|g' src/environments/environment.ts
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/crm-axel-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
