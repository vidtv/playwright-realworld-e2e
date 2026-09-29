FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock* ./

RUN corepack enable && yarn install

COPY . .

ARG REACT_APP_BACKEND_URL=http://api:3000/api
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

EXPOSE 8080

CMD ["yarn", "start"]