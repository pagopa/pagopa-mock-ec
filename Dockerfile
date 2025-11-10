FROM node:18.20-alpine

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