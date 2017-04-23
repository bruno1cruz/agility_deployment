FROM node:alpine

RUN mkdir /app

WORKDIR /app

COPY . /app

#RUN npm install -g bower
RUN npm install

#RUN echo '{ "allow_root": true }' > /root/.bowerrc

EXPOSE 7000

CMD [ "npm", "start" ]
