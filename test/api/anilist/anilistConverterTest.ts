import { MediaListCollection } from '../../../src/backend/api/anilist/graphql/seriesList';
import { readFileSync } from 'fs';
import assert from 'assert';
import { WatchStatus } from '../../../src/backend/controller/objects/series';
import anilistConverter from '../../../src/backend/api/anilist/anilist-converter';
import { MediaFormat } from '../../../src/backend/api/anilist/graphql/mediaFormat';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';


describe('Provider: AniList | Converter tests', () => {
    it('should convert', async () => {
        var rawdata = JSON.parse(readFileSync("./test/api/anilist/testResponse/anilistUserListResponse.json", { encoding: "UTF-8" }));
        var collection = rawdata.data.MediaListCollection as MediaListCollection;
        var entry = collection.lists[2].entries[3];
        var anime = await anilistConverter.convertListEntryToAnime(entry, WatchStatus.COMPLETED);
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
    })

    it('should convert format', async () => {
        const movieResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.MOVIE);
        const tvResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.TV);
        const tvShortResult = await anilistConverter['convertTypeToMediaType'](MediaFormat.TV_SHORT);
        assert.strictEqual(movieResult, MediaType.MOVIE);
        assert.strictEqual(tvResult, MediaType.ANIME);
        assert.strictEqual(tvShortResult, MediaType.ANIME);
        return;
    })
});
