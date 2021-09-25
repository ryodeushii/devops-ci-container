FROM node:alpine
RUN apk update 
# install deps
RUN npm install -g zx

WORKDIR /pipeline
COPY . ./
# install compose

CMD zx git.mjs