FROM mhart/alpine-node:latest AS build
WORKDIR /srv
ADD package.json .
RUN npm install
ADD . .

FROM mhart/alpine-node:slim-16.4.2
COPY --from=build /srv .
EXPOSE 3000
CMD ["node", "server.js"]