FROM node:18-alpine

WORKDIR /usr/src/app

# Copy the application source code from the build context
COPY . .

# Check the directory structure in the build logs for debugging
RUN ls -la /usr/src/app

# Enable Corepack for Yarn
RUN corepack enable

# Install dependencies
RUN yarn install

# Default environment variables for argos-realworld
ENV API_DIR=node-express
ENV CLIENT_DIR=react-redux

EXPOSE 3000 8080

CMD ["yarn", "start"]
