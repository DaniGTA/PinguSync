import { strictEqual } from 'assert';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import MediaTypeComperator from '../../../src/backend/helpFunctions/comperators/media-type-comperator';


describe('Media Type Comperator | Testrun', () => {
    beforeAll(() => {
    });
    test('should be both detected as normal series', async () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.ANIME;
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB), true);
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA), true);
    });

    test('should be both detected as normal series (same media type)', async () => {
        const mediaTypeA = MediaType.SERIES;
        const mediaTypeB = MediaType.SERIES;
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB), true);
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA), true);
    });

    test('should be both detected not as normal series', async () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.MOVIE;
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB), false);
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA), false);
    });

    test('should not be absolute false', async () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.ANIME;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_NONE);
        strictEqual(result.matchAble, 4);
        strictEqual(result.matches, 2);
    });

    test('should be max matches for anime and anime', async () => {
        const mediaTypeA = MediaType.ANIME;
        const mediaTypeB = MediaType.ANIME;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_NONE);
        strictEqual(result.matchAble, 4);
        strictEqual(result.matches, 4);
    });

    test('should be max matches for series and series', async () => {
        const mediaTypeA = MediaType.SERIES;
        const mediaTypeB = MediaType.SERIES;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_NONE);
        strictEqual(result.matchAble, 4);
        strictEqual(result.matches, 4);
    });
});
