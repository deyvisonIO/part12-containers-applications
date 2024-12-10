# Stage 1: Build the frontend
FROM node:20 AS build

WORKDIR /usr/src/app

# Copy the entire source code
COPY . .

# Install all dependencies (including devDependencies for build purposes)
RUN npm ci 

# Build the frontend (Vite)
RUN npm run build

# Stage 2: Serve the frontend using Nginx
FROM nginx:1.20.1-alpine

# Copy the built frontend files from the previous stage to Nginx's HTML folder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose the port Nginx will serve on
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
