
import assert from 'assert';
import { readFileSync } from 'fs';
import anilistConverter from '../../../src/backend/api/anilist/anilist-converter';
import { MediaFormat } from '../../../src/backend/api/anilist/graphql/mediaFormat';
import { MediaListCollection } from '../../../src/backend/api/anilist/graphql/seriesList';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import { WatchStatus } from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';

// tslint:disable: no-string-literal
describe('Provider: AniList | Converter tests', () => {
   test('should convert', async () => {
        const rawdata = JSON.parse(readFileSync('./test/api/anilist/testResponse/anilistUserListResponse.json', { encoding: 'UTF-8' }));
        const collection = rawdata.data.MediaListCollection as MediaListCollection;
        const entry = collection.lists[2].entries[3];
        const anime = await anilistConverter.convertListEntryToAnime(entry, WatchStatus.COMPLETED);
        const providerInfo = anime.mainProvider;
        if (providerInfo instanceof ListProviderLocalData) {
            const highestWatchedResult = providerInfo.getHighestWatchedEpisode();
            if (highestWatchedResult) {
                assert.strictEqual(highestWatchedResult.episode, 1);
            } else {
                assert.fail();
            }
            assert.strictEqual(anime.mainProvider.episodes, 1);
            assert.strictEqual(providerInfo.watchStatus, WatchStatus.COMPLETED);
        } else {
            assert.fail();
        }
        assert.strictEqual(providerInfo.score, 60);
        return;
    });

   test('should convert format', async () => {
        const movieResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.MOVIE);
        const tvResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.TV);
        const tvShortResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.TV_SHORT);
        assert.strictEqual(movieResult, MediaType.MOVIE);
        assert.strictEqual(tvResult, MediaType.ANIME);
        assert.strictEqual(tvShortResult, MediaType.ANIME);
        return;
    });
});
