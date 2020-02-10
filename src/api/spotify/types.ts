export interface SpotifyUserData {
  id: string;
  displayName: string;
  email: string;
  profilePicture?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: Array<string>;
  profilePicture?: string;
}

export interface TopArtistGraph {
  nodes: Array<{ id: string; label: string; image: string | undefined }>;
  edges: Array<{ to: string; from: string; title: string }>;
}
