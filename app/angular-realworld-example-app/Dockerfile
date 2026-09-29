FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining source code, including the realworld directory after git submodule update
COPY . .

EXPOSE 4200

# Replacement for the old CMD with --disable-host-check:
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
