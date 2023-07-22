# Build Stage
FROM node:alpine3.18 as build

COPY package.json ./
RUN yarn install --no-lockfile

COPY . .
RUN yarn build

# Runtime Stage 
FROM node:alpine3.18 as runtime

RUN mkdir -p "/var/www/app"
WORKDIR "/var/www/app"

COPY package.json ./
RUN yarn install --no-lockfile --prod

COPY --from=build dist dist

CMD ["yarn", "start:prod"]