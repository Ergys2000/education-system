# syntax=docker/dockerfile:1
FROM node:14.17.0-alpine
WORKDIR /app
COPY . .
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python \
	&& npm install \
	&& npm install -g serve
CMD npm run build && serve -s build/
