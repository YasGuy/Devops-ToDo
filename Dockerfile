FROM node:22 AS build

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:22-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app .

EXPOSE 3030

# Command to run your app
CMD ["npm", "start"]
