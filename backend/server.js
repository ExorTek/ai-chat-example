'use strict';
require('dotenv').config();

const { PORT, HOST } = process.env;

const app = require('./app');

const startServer = () => {
  app.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening on ${address}`);
  });
};

startServer();
