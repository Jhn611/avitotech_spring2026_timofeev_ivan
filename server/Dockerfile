# ================== Stage 1: Dependencies ==================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ================== Stage 2: Production ==================
FROM node:20-alpine AS production

WORKDIR /app

# Создаём непривилегированного пользователя (рекомендуется)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Копируем package.json и устанавливаем только production-зависимости
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Копируем весь исходный код (tsx будет запускать .ts файлы напрямую)
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

USER appuser

EXPOSE 3000

# Запускаем точно так же, как у тебя локально — "npm start"
CMD ["npm", "start"]