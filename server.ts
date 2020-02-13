import * as Hapi from 'hapi';
import Routes from './src/api';
import { DBClient } from './src/db';

export async function init(): Promise<Hapi.Server> {
  try {
    const port = process.env.PORT;

    const server = new Hapi.Server({
      port,
      routes: {
        cors: {
          origin: ['*'],
          headers: ['Authorization', 'access_token'],
          exposedHeaders: ['Accept'],
          additionalExposedHeaders: ['Accept'],
          credentials: true
        }
      }
    });

    Routes.forEach(r => {
      server.route(r);
    });

    await DBClient.init();

    return server;
  } catch (err) {
    console.log('Error starting server: ', err);
    throw err;
  }
}
