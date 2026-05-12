FROM mcr.microsoft.com/playwright:v1.49.0-noble

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
