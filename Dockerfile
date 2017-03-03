FROM node:alpine

RUN mkdir /app

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 7000

CMD [ "npm", "start" ]
