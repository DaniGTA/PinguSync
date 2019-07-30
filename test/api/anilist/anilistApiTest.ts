import AnimeListProvider from '../../../src/backend/api/anilist/aniListProvider';
import request from 'request';
import { MediaListCollection } from '../../../src/backend/api/anilist/graphql/seriesList';
import aniListConverter from '../../../src/backend/api/anilist/aniListConverter';
import { readFileSync, readFile } from 'fs';
import assert from 'assert';
import { WatchStatus } from '../../../src/backend/controller/objects/series';


describe('AniListApi Tests', () => {
    it('should return headers', async () => {
        var options: (request.UriOptions & request.CoreOptions) = {
            uri: 'https://graphql.anilist.co',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: "query",
                variables: "variables"
            })
        };

        const a = new AnimeListProvider();
        const result = a["getGraphQLOptions"]("query", "variables");
        assert.equal(options.body, result.body);
        assert.equal(options.headers + '', result.headers + '');
        assert.equal(options.method, result.method);
        assert.equal(options.uri, result.uri);
        return;
    })

    it('should convert', async () => {
        var rawdata = JSON.parse(readFileSync("./test/api/anilist/testResponse/anilistUserListResponse.json", { encoding: "UTF-8" }));
        var collection = rawdata.data.MediaListCollection as MediaListCollection;
        var entry = collection.lists[2].entries[3];
        var anime = await aniListConverter.convertListEntryToAnime(entry, WatchStatus.COMPLETED);
        const providerInfo = anime.listProviderInfos[0];
        const highestWatchedResult = providerInfo.getHighestWatchedEpisode();
        if (highestWatchedResult) {
            assert.strictEqual(highestWatchedResult.episode, 1);
        } else {
            assert.fail();
        }
        assert.strictEqual(await anime.getMaxEpisode(), 1);
        assert.strictEqual(providerInfo.watchStatus, WatchStatus.COMPLETED);
        assert.strictEqual(providerInfo.score, 60);
        return;
    })
});
