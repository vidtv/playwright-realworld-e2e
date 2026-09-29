FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json yarn.lock* ./

RUN corepack enable && yarn install

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=development
ENV SECRET=secret_key

CMD ["yarn", "start"]