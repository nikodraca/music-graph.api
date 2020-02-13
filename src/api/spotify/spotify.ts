import * as rp from 'request-promise';
import { DBClient } from '../../db';
import { SpotifyUserData, SpotifyArtist, TopArtistGraph } from './types';

export class SpotifyUser {
  static async fetch({
    spotifyUserId,
    spotifyAccessToken
  }: {
    spotifyUserId: string | undefined;
    spotifyAccessToken: string | undefined;
  }): Promise<SpotifyUser> {
    let userData: SpotifyUserData;
    let topArtists: Array<SpotifyArtist>;

    //   1. try to fetch from db
    if (spotifyUserId) {
      const userRecord = await DBClient.findRecord('graphs', 'users', { 'userData.id': spotifyUserId });

      if (userRecord) {
        userData = userRecord.userData;
        topArtists = userRecord.topArtists;

        return new SpotifyUser(userData, topArtists);
      }
    }

    //new auth user, fetch data from Spotify API and save to db
    else if (spotifyAccessToken) {
      const response = await SpotifyUser.fetchSpotifyData(spotifyAccessToken, 'https://api.spotify.com/v1/me');

      userData = {
        id: response.id,
        displayName: response.display_name,
        email: response.email,
        profilePicture: response.images[0]?.url
      };

      topArtists = await SpotifyUser.getTopArtists(spotifyAccessToken);

      await DBClient.insertRecord(
        'graphs',
        'users',
        { 'userData.id': userData.id },
        { $set: { userData, topArtists } }
      );

      return new SpotifyUser(userData, topArtists);
    }

    throw new Error('Could not fetch user data');
  }

  static async fetchSpotifyData(accessToken: string, uri: string) {
    try {
      return await rp({
        method: 'GET',
        uri,
        json: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch (err) {
      throw new Error(err.error.error.message);
    }
  }

  static async getTopArtists(accessToken: string): Promise<Array<SpotifyArtist>> {
    const response = await SpotifyUser.fetchSpotifyData(
      accessToken,
      `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term`
    );

    return response.items.map(
      (artist: any): SpotifyArtist => {
        return {
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          profilePicture: artist.images[0]?.url
        };
      }
    );
  }

  private readonly userData: SpotifyUserData;
  private readonly topArtists: Array<SpotifyArtist>;

  private constructor(userData: SpotifyUserData, topArtists: Array<SpotifyArtist>) {
    this.userData = userData;
    this.topArtists = topArtists;
  }

  // create adjency list of artists by common genres
  generateTopArtistsGraph(): TopArtistGraph {
    const networkGraph: TopArtistGraph = {
      nodes: [],
      edges: []
    };

    const genreMap: any = {};

    this.topArtists.forEach(artist => {
      // create every possible node
      networkGraph.nodes.push({ id: artist.id, label: artist.name, image: artist.profilePicture });

      // create map of all genres and corresponding artists
      artist.genres.forEach(genre => {
        if (!genreMap[genre]) genreMap[genre] = [artist.id];
        else {
          // add edge for every existing artist to this new artist
          genreMap[genre].forEach((genreArtist: string) => {
            networkGraph.edges.push({
              from: genreArtist,
              to: artist.id,
              title: genre
            });
          });

          genreMap[genre].push(artist.id);
        }
      });
    });

    return networkGraph;
  }

  formatResponse() {
    const artistGraph = this.generateTopArtistsGraph();

    return {
      user: this.userData,
      artistGraph: artistGraph
    };
  }
}
