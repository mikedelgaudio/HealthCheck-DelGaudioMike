FROM node:alpine
RUN mkdir -p /usr/src
WORKDIR /usr/src

ENV MAIL_PASS=YOUR_MAIL_PASS
COPY . /usr/src
RUN npm install
CMD node index.js 