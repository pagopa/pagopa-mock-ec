FROM node:14-alpine

RUN pwd
RUN ls -lrt

COPY dist dist
COPY node_modules node_modules

WORKDIR /src
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
EXPOSE 8089
RUN ls -lrt
CMD ["node", "dist/index.js"]