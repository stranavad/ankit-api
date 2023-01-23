FROM node:18-alpine

WORKDIR /user/src/app

COPY . .

RUN npm ci

RUN npm run build 
USER node

EXPOSE 3001

CMD ["npm", "run", "start:prod"]