FROM node:18-alpine

# Fix for workspace:* support — npm10 works with Node 18
RUN npm install -g npm@11

WORKDIR /app

# Copy only root package files
COPY package.json package-lock.json ./

# Copy workspaces (shared-utils, other packages)
COPY packages ./packages

# Copy service package definition
COPY src/gateway/package.json ./src/gateway/

# Install dependencies for this workspace only
RUN npm install --workspace=src/gateway

# Copy full repo after deps
COPY . .

# Build only this service
RUN npm run build --workspace=src/gateway

EXPOSE 3000

CMD ["node", "src/gateway/dist/index.js"]
