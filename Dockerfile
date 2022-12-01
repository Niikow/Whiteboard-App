FROM mhart/alpine-node:14 AS build
WORKDIR /srv
ADD package.json .
RUN npm install
ADD . .

FROM mhart/alpine-node:base-9
COPY --from=build /srv .
EXPOSE 3000
CMD ["node", "server.js"]