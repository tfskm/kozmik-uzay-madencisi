# Kozmik Yolculuk - sunucu destekli sürüm (kz/)
# Express + SQLite + Vite istemcisi. Derleme araçları yalnızca build aşamasında kullanılır;
# çalışma aşaması derlenmiş node_modules'ı devralır (daha küçük ve hızlı derleme).

# ---- Build aşaması ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 için derleme araçları
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY kz/package*.json ./
RUN npm install

COPY kz/ ./
RUN npm run build

# ---- Çalışma aşaması ----
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Derlenmiş bağımlılıkları build aşamasından al; burada derleme aracı GEREKMEZ.
# (better-sqlite3 ikilisi build aşamasında hazırlanmış olarak gelir.)
COPY kz/package*.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev || echo "prune atlandi"

COPY --from=build /app/dist ./dist
COPY kz/server ./server

# SQLite veritabanı bu klasörde tutulur (Coolify'da /data volume bağlayın)
RUN mkdir -p /data
ENV DB_PATH=/data/game.db

# 3000: varsayılan, 80: eski kurulumun portuyla uyumluluk için
EXPOSE 3000 80

CMD ["node", "server/index.js"]
