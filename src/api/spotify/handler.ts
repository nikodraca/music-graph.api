import { Request } from 'hapi';
import * as rp from 'request-promise';
import * as Boom from '@hapi/boom';

export const getUserData = async (req: Request) => {
  const { spotifyAccessToken } = req.query;

  if (!spotifyAccessToken) return Boom.badRequest('Missing Spotify access token');

  try {
    let userResp = await rp({
      method: 'GET',
      uri: 'https://api.spotify.com/v1/me',
      json: true,
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`
      },
      resolveWithFullResponse: true
    });

    return userResp;
  } catch (err) {
    return Boom.badRequest(err.error.error.message);
  }
};
