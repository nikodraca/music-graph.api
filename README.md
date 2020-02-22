# music-graph.api
API for Music Graph project. The repo UI is [here](https://github.com/nikodraca/music-graph.ui). 
Should have a MongoDB instance running and update the environment variables to connect to it.

## Endpoints
### Get Spotify user

`GET /spotify/user?spotifyUserId={spotifyUserId} -h access_token={spotifyAccessToken}`

If no `spotifyUserId` query parameter is provided but a `access_token` header is (containing a valid Spotify access token), 
it will fetch the data and store to MongoDB. If a `spotifyUserId` query parameter is attached, it will fetch data from MongoDB directly.

The algorithm will build an adjacency list based on the artist's genre list. The response has a node for every artist and an edge defining the relationships between artist genres.

### Example Response:
```
{
	"user": {
		"id": "some.user.id",
		"displayName": "Some User",
		"email": "someuser@email.com",
		"profilePicture": "https://profile-picture.png"
	},
	"artistGraph": {
		"nodes": [{
			"id": "3TVXtAsR1Inumwj472S9r4",
			"label": "Drake",
			"image": "https://i.scdn.co/image/012ecd119617ac24ab56620ace4b81735b172686"
		}...],
		"edges": [{
			"from": "6LEeAFiJF8OuPx747e1wxR",
			"to": "247AfC9pLuqwgpH8Mo96oA",
			"title": "chillwave"
		}...]
	}
}
```

