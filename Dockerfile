FROM node:18.18

WORKDIR /home/node/app

RUN apt-get update && apt-get install -y openssl

# Copia os arquivos de dependência
COPY package*.json .

# Copia a pasta prisma ANTES do npm install
COPY prisma ./prisma

# Agora o npm install encontrará o schema.prisma para o postinstall
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

CMD ["npm", "run", "dev"]
