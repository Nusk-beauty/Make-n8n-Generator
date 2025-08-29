FROM node:20-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./backend/
WORKDIR /usr/src/app/backend
RUN npm install --production

COPY backend/ /usr/src/app/backend

WORKDIR /usr/src/app/backend

EXPOSE 4000

CMD ["node", "src/index.js"]
