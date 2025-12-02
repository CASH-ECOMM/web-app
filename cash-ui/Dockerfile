# Use official Node.js image as the build environment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the app for production
RUN npm run build

# ---
# Production image: serve with 'serve' package
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start serve (serves static files with SPA support)
CMD ["serve", "-s", "dist", "-l", "3000"]
