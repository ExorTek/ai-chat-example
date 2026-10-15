'use strict';

require('dotenv').config();

const buildApp = require('./app');
const config = require('./src/config');

const app = buildApp();

const shutdown = async signal => {
  app.log.info(`${signal} received, shutting down`);
  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error({ err: error }, 'graceful shutdown failed');
    process.exit(1);
  }
};

const start = async () => {
  try {
    const address = await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server listening on ${address}`);
  } catch (error) {
    app.log.error({ err: error }, 'failed to start server');
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => shutdown(signal)));

start();
