import { RouteConfig } from '../../types/route.type';
import { getUserData } from './handler';

const SpotifyRoutes: RouteConfig[] = [
  {
    method: 'GET',
    path: '/spotify/user',
    handler: getUserData
  }
];

export { SpotifyRoutes };
