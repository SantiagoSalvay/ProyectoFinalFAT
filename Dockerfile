# Usar imagen de Node.js
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
COPY server/package.json server/pnpm-lock.yaml ./server/

# Instalar dependencias del frontend y backend
RUN pnpm install --frozen-lockfile
RUN cd server && pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN cd server && npx prisma generate

# Build del frontend
RUN pnpm run build

# Exponer puerto
EXPOSE 3001

# Comando para iniciar el servidor
CMD ["node", "server/src/index.js"]

