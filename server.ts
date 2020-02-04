import * as Hapi from 'hapi';
import Routes from './src/api';

export async function init(): Promise<Hapi.Server> {
  try {
    const port = process.env.PORT;

    const server = new Hapi.Server({
      debug: { request: ['error'] },
      port,
      routes: {
        cors: {
          origin: ['*']
        }
      }
    });

    Routes.forEach(r => {
      server.route(r);
    });

    return server;
  } catch (err) {
    console.log('Error starting server: ', err);
    throw err;
  }
}
