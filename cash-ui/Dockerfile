# Use official Node.js image as the build environment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Build arguments for environment variables (with defaults for production)
ARG VITE_API_URL=https://router-service-production.up.railway.app/api
ARG VITE_AI_API_URL=https://ai-agent-production-b7fd.up.railway.app/api
# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL

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
