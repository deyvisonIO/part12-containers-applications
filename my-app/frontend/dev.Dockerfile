FROM node:20

WORKDIR /usr/src/app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm ci 

# Expose the port Vite will be served on
EXPOSE 5173

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]
