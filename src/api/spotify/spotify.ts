import * as rp from 'request-promise';

import { SpotifyUserData, SpotifyArtist, TopArtistGraph } from './types';

const fetchSpotifyData = async (accessToken: string, uri: string) => {
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
};

export class SpotifyUser {
  static async fetch(accessToken: string): Promise<SpotifyUser> {
    const response = await fetchSpotifyData(accessToken, 'https://api.spotify.com/v1/me');

    const userData: SpotifyUserData = {
      id: response.id,
      displayName: response.display_name,
      email: response.email,
      profilePicture: response.images[0]?.url
    };

    return new SpotifyUser(accessToken, userData);
  }

  private readonly accessToken: string;
  private readonly userData: SpotifyUserData;
  private topArtists?: Array<SpotifyArtist>;
  private artistGraph?: TopArtistGraph;

  private constructor(accessToken: string, userData: SpotifyUserData) {
    this.accessToken = accessToken;
    this.userData = userData;
  }

  async getTopArtists(): Promise<void> {
    const response = await fetchSpotifyData(this.accessToken, `https://api.spotify.com/v1/me/top/artists?limit=50`);

    this.topArtists = response.items.map(
      (artist: any): SpotifyArtist => {
        return {
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          profilePicture: artist.images[0]?.url
        };
      }
    );

    this.generateTopArtistsGraph();
  }

  // create adjency list of artists by common genres
  generateTopArtistsGraph(): void {
    const networkGraph: TopArtistGraph = {
      nodes: [],
      edges: []
    };

    const genreMap: any = {};

    this.topArtists!.forEach(artist => {
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

    this.artistGraph = networkGraph;
  }

  formatResponse() {
    return {
      user: this.userData,
      artistGraph: this.artistGraph
    };
  }
}
