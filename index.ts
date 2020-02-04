require('dotenv').config();

import * as Server from './server';

const start = async () => {
  try {
    const server = await Server.init();
    await server.start();
    console.log('Server running at:', server.info.uri);
  } catch (err) {
    console.error('Error starting server: ', err.message);
    throw err;
  }
};

start();
