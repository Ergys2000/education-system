# syntax=docker/dockerfile:1
FROM node:14.17.0-alpine
WORKDIR /app
COPY . .
RUN apk add --update --no-cache python3 \
	&& ln -sf python3 /usr/bin/python \
	&& npm install
CMD npm start
