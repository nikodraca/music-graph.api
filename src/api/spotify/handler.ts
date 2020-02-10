import { Request } from 'hapi';
import { SpotifyUser } from './spotify';
import * as Boom from '@hapi/boom';

export const getUserData = async (req: Request) => {
  try {
    const spotifyAccessToken = req.headers.access_token;

    if (!spotifyAccessToken) return Boom.badRequest('Missing Spotify access token');

    const spotifyUser = await SpotifyUser.fetch(spotifyAccessToken as string);
    await spotifyUser.getTopArtists();

    return spotifyUser.formatResponse();
  } catch (err) {
    return Boom.badRequest(err);
  }
};
