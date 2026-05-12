FROM mcr.microsoft.com/playwright:v1.49.0-noble

# Node.js sürümünü yükselt (Prisma 7 desteği için)
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package*.json ./
RUN npm ci

# Proje dosyalarını kopyala
COPY . .

# Prisma ve Next build
RUN npx prisma generate
RUN npm run build

# Railway port ayarı
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
