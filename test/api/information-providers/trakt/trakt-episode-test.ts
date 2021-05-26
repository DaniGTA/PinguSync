/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list'
import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider'
import { Movies } from '../../../../src/backend/api/information-providers/trakt/objects/movies'
import Episode from '../../../../src/backend/controller/objects/meta/episode/episode'
import EpisodeTitle from '../../../../src/backend/controller/objects/meta/episode/episode-title'
import Season from '../../../../src/backend/controller/objects/meta/season'

describe('Provider: Trakt | movies/series get tested', () => {
    const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider)

    test('should not throw', async () => {
        const repsoneshould = {
            body:
                '{"added":{"movies":1,"episodes":0},"not_found":{"movies":[],"shows":[],"seasons":[],"episodes":[],"people":[]}}',
            statusCode: 200,
        }
        traktProviderInstance['traktRequest'] = jest.fn(async () => repsoneshould) as any
        const episodetitle = new EpisodeTitle('no-game-no-life-zero-2017')
        const episode = new Episode(1, undefined, [episodetitle])
        const testmovie: Movies = { movies: [] }
        testmovie.movies.push({ ids: { slug: 'no-game-no-life-zero-2017' }, watched_at: new Date() })
        await expect(traktProviderInstance.markEpisodeAsWatched([episode])).resolves.not.toThrow()
    })
})
