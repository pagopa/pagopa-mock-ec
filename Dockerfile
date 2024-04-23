FROM node:14-alpine@sha256:434215b487a329c9e867202ff89e704d3a75e554822e07f3e0c0f9e606121b33

WORKDIR /src

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

COPY . .

EXPOSE 8089

RUN npm run generate build
CMD ["node", "dist/index.js"]
