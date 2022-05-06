FROM node:14-alpine

WORKDIR /src

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

COPY . .

EXPOSE 8089

RUN npm run generate build
CMD ["node", "dist/index.js"]
