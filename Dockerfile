# Usar imagen de Node.js
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar el código completo primero
COPY . .

# Instalar dependencias del backend (sin ejecutar postinstall del root)
RUN cd server && pnpm install --frozen-lockfile

# Generar Prisma Client
RUN cd server && npx prisma generate

# Instalar dependencias del frontend (con --ignore-scripts para evitar postinstall)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build del frontend
RUN pnpm run build

# Exponer puerto
EXPOSE 3001

# Comando para iniciar el servidor
CMD ["node", "server/src/index.js"]

