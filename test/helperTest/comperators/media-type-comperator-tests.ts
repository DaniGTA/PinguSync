import { strictEqual } from 'assert';
import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import MediaTypeComperator from '../../../src/backend/helpFunctions/comperators/media-type-comperator';
import TestHelper from '../../test-helper';

describe('Media Type Comperator | Testrun', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
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

    test('should be both detected as normal series', async () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.MOVIE;
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB), false);
        strictEqual(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA), false);
    });
});
