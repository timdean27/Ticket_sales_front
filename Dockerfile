# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from the current directory to the working directory
COPY . .

# Build your app
RUN npm run build

# Expose the port your app runs on
EXPOSE 5173

# Define the command to run your app using serve
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
