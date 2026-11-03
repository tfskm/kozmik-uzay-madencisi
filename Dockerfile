FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

# Dosyalar alt klasördeyse ana dizine al
RUN if [ -d "./kozmik-yolculuk---web3-uzay-madencisi" ]; then \
      cp -r ./kozmik-yolculuk---web3-uzay-madencisi/* ./; \
    fi

RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf

# Nginx ayarını kopyala
COPY --from=builder /app/nginx.conf* /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
