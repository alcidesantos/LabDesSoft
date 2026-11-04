FROM node:24-slim
# Instala o OpenSSL, que o Prisma precisa para funcionar
RUN apt-get update -y && apt-get install -y openssl
# Define a pasta de trabalho
WORKDIR /app