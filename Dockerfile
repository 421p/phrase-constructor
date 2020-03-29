FROM node:alpine

RUN mkdir /app

WORKDIR /app

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock

RUN yarn

ADD index.js /app/index.js
ADD mapping.xml /app/mapping.xml

CMD ["node", "index.js"]
