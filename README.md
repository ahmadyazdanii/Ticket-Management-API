## Description

A fully tested Nest.js API that you can manage your support tickets easily. It created with following technologies:

- Nest.js (Express)
- MongoDB

## Usage

You have a small to medium product, and you want an on-premise help desk ticketing system that enables your product to manage the tickets and your agents responsible for answering the questions/problems. Also, you don't want to change your structure.

## Requirements

You only need [`Docker`](https://www.docker.com/) installed in your machine. Also, you have to create a `.env` file in root directory and put environment variables that exist in the `.env.sample` into it.

## Deploy

```bash
$ docker compose up -d --build
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
