# Step 1: Use Node.js 22 base image
FROM node:22 AS base

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the app's source code
COPY . .

# Step 6: Expose the development server's default port
EXPOSE 3000

# need to pass env vars as well

# Step 7: Start the React development server
CMD ["npm", "start"]
