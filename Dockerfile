# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for the build step)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Vite client and esbuild server
RUN npm run build

# Stage 2: Create the production runtime image
FROM node:20-alpine

WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies to keep the image small
RUN npm install --omit=dev

# Copy the compiled production output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 5000

# Command to start the application
CMD ["npm", "run", "start"]
