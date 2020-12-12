import { MediaType } from '../../../src/backend/controller/objects/meta/media-type';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import MediaTypeComperator from '../../../src/backend/helpFunctions/comperators/media-type-comperator';


describe('Media Type Comperator | Testrun', () => {
    test('should be both detected as normal series', () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.ANIME;
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB)).toBe(true);
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA)).toBe(true);
    });

    test('should be both detected as normal series (same media type)', () => {
        const mediaTypeA = MediaType.SERIES;
        const mediaTypeB = MediaType.SERIES;
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB)).toBe(true);
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA)).toBe(true);
    });

    test('should be both detected not as normal series', () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.MOVIE;
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeA, mediaTypeB)).toBe(false);
        expect(MediaTypeComperator.areTheseMediaTypeBothNormalSeries(mediaTypeB, mediaTypeA)).toBe(false);
    });

    test('should not be absolute false', () => {
        const mediaTypeA = MediaType.UNKOWN_SERIES;
        const mediaTypeB = MediaType.ANIME;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        expect(result.isAbsolute).toBe(AbsoluteResult.ABSOLUTE_NONE);
        expect(result.matchAble).toBe(4);
        expect(result.matches).toBe(2);
    });

    test('should be max matches for anime and anime', () => {
        const mediaTypeA = MediaType.ANIME;
        const mediaTypeB = MediaType.ANIME;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        expect(result.isAbsolute).toBe(AbsoluteResult.ABSOLUTE_NONE);
        expect(result.matchAble).toBe(4);
        expect(result.matches).toBe(4);
    });

    test('should be max matches for series and series', () => {
        const mediaTypeA = MediaType.SERIES;
        const mediaTypeB = MediaType.SERIES;
        const result = MediaTypeComperator.comperaMediaType(mediaTypeA, mediaTypeB);
        expect(result.isAbsolute).toBe(AbsoluteResult.ABSOLUTE_NONE);
        expect(result.matchAble).toBe(4);
        expect(result.matches).toBe(4);
    });
});
