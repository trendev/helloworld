FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 9000
CMD [ "node" , "server.js"]
