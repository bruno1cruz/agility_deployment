FROM node:alpine

RUN mkdir /app

WORKDIR /app

COPY . /app

RUN npm install bower
RUN npm install
RUN bower install

EXPOSE 7000

CMD [ "npm", "start" ]
