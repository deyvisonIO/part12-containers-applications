FROM node:20

WORKDIR /usr/src/app

# Copy the rest of your application code
COPY . .

# Install all dependencies (including devDependencies for build purposes)
RUN npm ci 

# Expose the port the app runs on
EXPOSE 3003

# Start the application
CMD ["npm", "run", "start"]
