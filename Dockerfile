# Build Stage
FROM node as build

COPY package.json ./
RUN npm install --no-package-lock

COPY . .
RUN npm run build

# Runtime Stage 
FROM node as runtime

RUN mkdir -p "/var/www/app"
WORKDIR "/var/www/app"

COPY package.json ./
RUN npm install --no-package-lock --omit dev

COPY --from=build dist dist

CMD ["npm", "run", "start:prod"]