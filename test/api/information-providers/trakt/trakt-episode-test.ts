import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider';
import { Movies } from '../../../../src/backend/api/information-providers/trakt/objects/movies';
import Episode from '../../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../../../src/backend/controller/objects/meta/episode/episode-title';


describe('Provider: Trakt | movies/series get tested', () => {
    const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider);

    test ('should mark movie as watched', async () => {
        const episodetitle  = new EpisodeTitle('no-game-no-life-zero-2017');
        const episode = new Episode(1,undefined, [episodetitle])
        const testmovie: Movies = {movies: []};
        testmovie.movies.push({ids:{slug:'no-game-no-life-zero-2017'}, watched_at : new Date()});
        const response = await traktProviderInstance.markEpisodeAsWatched(episode);

        expect(response).toBe('');
    });

});
