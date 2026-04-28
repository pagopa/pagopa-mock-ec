FROM node:14-alpine

WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 8089

RUN npm run generate build
CMD ["node", "dist/index.js"]
