
import assert from 'assert';
import { readFileSync } from 'fs';

import anilistConverter from '../../../../src/backend/api/information-providers/anilist/anilist-converter';
import { MediaFormat } from '../../../../src/backend/api/information-providers/anilist/graphql/mediaFormat';
import { MediaListCollection } from '../../../../src/backend/api/information-providers/anilist/graphql/seriesList';
import { MediaType } from '../../../../src/backend/controller/objects/meta/media-type';
import { ListProviderLocalData } from '../../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { ListType } from '../../../../src/backend/controller/settings/models/provider/list-types';

// tslint:disable: no-string-literal
describe('Provider: AniList | Converter tests', () => {
    test('should convert', async () => {
        const rawdata = JSON.parse(readFileSync('./test/api/information-providers/anilist/testResponse/anilistUserListResponse.json', { encoding: 'UTF-8' }));
        const collection = rawdata.data.MediaListCollection as MediaListCollection;
        const entry = collection.lists[2].entries[3];
        const anime = await anilistConverter.convertListEntryToAnime(entry, ListType.COMPLETED);
        const providerInfo = anime.mainProvider.providerLocalData;
        if (providerInfo instanceof ListProviderLocalData) {
            assert.strictEqual(anime.mainProvider.providerLocalData.episodes, 1);
            assert.strictEqual(providerInfo.watchStatus, ListType.COMPLETED);
        } else {
            assert.fail();
        }
        expect(providerInfo.score).toEqual(60);
        return;
    });

    test('should convert format', () => {
        const movieResult = anilistConverter['convertTypeToMediaType'](MediaFormat.MOVIE);
        const tvResult = anilistConverter['convertTypeToMediaType'](MediaFormat.TV);
        const tvShortResult = anilistConverter['convertTypeToMediaType'](MediaFormat.TV_SHORT);
        expect(movieResult).toEqual(MediaType.MOVIE);
        expect(tvResult).toEqual(MediaType.ANIME);
        expect(tvShortResult).toEqual(MediaType.ANIME);
        return;
    });
});
