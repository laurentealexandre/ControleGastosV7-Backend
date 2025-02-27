FROM node:16

# Cria e define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código-fonte para o container
COPY . .

# Expõe a porta que seu backend usa
EXPOSE 3001

# Comando para iniciar a aplicação
# Ajuste o nome do arquivo principal se necessário (index.js, app.js, server.js)
CMD ["node", "app.js"]