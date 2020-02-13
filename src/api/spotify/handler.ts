import { Request } from 'hapi';
import { SpotifyUser } from './spotify';
import * as Boom from '@hapi/boom';

export const getUserData = async (req: Request) => {
  try {
    const spotifyUserId = req.query.spotifyUserId as string | undefined;
    const spotifyAccessToken = req.headers.access_token;

    if (!spotifyUserId && !spotifyAccessToken) return Boom.badRequest('Missing credentials');

    const spotifyUser = await SpotifyUser.fetch({ spotifyAccessToken, spotifyUserId });

    return spotifyUser.formatResponse();
  } catch (err) {
    return Boom.badRequest(err);
  }
};
