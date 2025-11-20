FROM node:18-alpine

# Fix for workspace:* support — npm10 works with Node 18
RUN npm install -g npm@11

WORKDIR /app

# 1. Copy root package files first so npm sees workspace:*
COPY package.json package-lock.json ./

# 2. Copy all workspace folders
COPY packages ./packages
COPY src ./src

# Install dependencies for this workspace only
RUN npm install --workspace=src/services/notification-service

# Build only this service
RUN npm run build --workspace=src/services/notification-service

EXPOSE 4004

CMD ["node", "src/services/notification-service/dist/server.js"]