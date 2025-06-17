# Multi-stage build for optimized production image

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install


ARG VITE_MAPBOX_ACCESS_TOKEN
ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Set up the production environment
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the server file
COPY server.cjs ./

# Copy the built React app from the previous stage
COPY --from=frontend-builder /app/dist ./dist

# Expose the port the server listens on
EXPOSE 3000

# Command to run the server
CMD ["node", "server.cjs"]