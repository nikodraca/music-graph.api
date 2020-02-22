import { expect } from 'chai';
import * as sinon from 'sinon';
import { DBClient } from '../src/db';
import { mockMongoUserResponse, mockSpotifyUserResponse, mockSpotifyTopArtistResponse } from './mock';

import { SpotifyUser } from '../src/api/spotify/spotify';

describe('SpotifyUser', () => {
  let sandbox: sinon.SinonSandbox;
  let findRecordStub: sinon.SinonStub;
  let insertRecordStub: sinon.SinonStub;
  let fetchUserFromSpotifyStub: sinon.SinonStub;
  let fetchTopArtistFromSpotifyStub: sinon.SinonStub;
  let generateTopArtistsGraphSpy: sinon.SinonSpy;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    findRecordStub = sandbox.stub(DBClient, 'findRecord' as any).resolves(mockMongoUserResponse);
    insertRecordStub = sandbox.stub(DBClient, 'insertRecord' as any);
    fetchUserFromSpotifyStub = sandbox.stub(SpotifyUser, 'getUser' as any).resolves(mockSpotifyUserResponse);
    fetchTopArtistFromSpotifyStub = sandbox
      .stub(SpotifyUser, 'getTopArtists' as any)
      .resolves(mockSpotifyTopArtistResponse);
    generateTopArtistsGraphSpy = sandbox.spy(SpotifyUser.prototype, 'generateTopArtistsGraph' as any);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#fetch', () => {
    it('Should fetch from MongoDB if user ID provided', async () => {
      await SpotifyUser.fetch({ spotifyUserId: 'user_id', spotifyAccessToken: undefined });
      expect(findRecordStub.calledOnce).to.be.true;
      expect(insertRecordStub.notCalled).to.be.true;
      expect(fetchUserFromSpotifyStub.notCalled).to.be.true;
    });

    it('Should fetch from MongoDB if user ID and access token provided', async () => {
      await SpotifyUser.fetch({ spotifyUserId: 'user_id', spotifyAccessToken: 'valid-access-token' });
      expect(findRecordStub.calledOnce).to.be.true;
      expect(insertRecordStub.notCalled).to.be.true;
      expect(fetchUserFromSpotifyStub.notCalled).to.be.true;
    });

    it('Should fetch from Spotify if access token provided', async () => {
      await SpotifyUser.fetch({ spotifyUserId: undefined, spotifyAccessToken: 'valid-access-token' });
      expect(findRecordStub.notCalled).to.be.true;
      expect(insertRecordStub.calledOnce).to.be.true;
      expect(fetchUserFromSpotifyStub.calledOnce).to.be.true;
      expect(fetchTopArtistFromSpotifyStub.calledOnce).to.be.true;
    });

    it('Should throw if neither access token ', async () => {
      let error;

      try {
        await SpotifyUser.fetch({ spotifyUserId: undefined, spotifyAccessToken: undefined });
      } catch (err) {
        error = err;
      }

      expect(error.message).to.be.eql('Could not fetch user data');
      expect(findRecordStub.notCalled).to.be.true;
      expect(insertRecordStub.notCalled).to.be.true;
      expect(fetchUserFromSpotifyStub.notCalled).to.be.true;
    });
  });

  describe('#formatResponse', () => {
    it('Should generate adjency list and user data', async () => {
      const spotifyUser = await SpotifyUser.fetch({
        spotifyUserId: 'user_id',
        spotifyAccessToken: 'valid-access-token'
      });

      const response = spotifyUser.formatResponse();

      expect(generateTopArtistsGraphSpy.calledOnce).to.be.true;
      expect(response.user.id).to.be.eql(mockSpotifyUserResponse.id);

      expect(
        response.artistGraph.nodes.find(({ id, label }) => id === '5K4W6rqBFWDnAN6FQUkS6x' && label === 'Kanye West')
      ).to.not.be.undefined;
      expect(response.artistGraph.nodes.find(({ id, label }) => id === '3TVXtAsR1Inumwj472S9r4' && label === 'Drake'))
        .to.not.be.undefined;

      expect(
        response.artistGraph.edges.find(
          ({ from, to, title }) =>
            from === '3TVXtAsR1Inumwj472S9r4' && to === '5K4W6rqBFWDnAN6FQUkS6x' && title === 'rap'
        )
      );
    });
  });
});
