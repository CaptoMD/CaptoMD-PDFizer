FROM node:10-alpine

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Set a working directory
WORKDIR /usr/src/app

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Run the container under "node" user by default
USER node

EXPOSE 9440

CMD [ "npm", "start" ]
