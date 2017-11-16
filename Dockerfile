FROM node:latest

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN yarn

# Make output directory. Everything in here will be publicly accessible
RUN mkdir -p /www

# Bundle app source
COPY . /usr/app

EXPOSE 9440

CMD [ "npm", "start" ]
