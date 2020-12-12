import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import SeasonComperator from '../../../src/backend/helpFunctions/comperators/season-comperator';


describe('Season Comperator tests', () => {
    test('should equals true (same season)', () => {
        const season1 = new Season([1]);
        const season2 = new Season([1]);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(true);
    });

    test('should equals false (wrong season)', () => {
        const season1 = new Season([1]);
        const season2 = new Season([2]);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(false);
    });

    test('should equals false (right season and wrong part) ', () => {
        const season1 = new Season([1], 1);
        const season2 = new Season([1], 2);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(false);
    });

    test('should equals true (right season and part)', () => {
        const season1 = new Season([1], 2);
        const season2 = new Season([1], 2);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(true);
    });

    test('should equals false (wrong season and right part)', () => {
        const season1 = new Season([1], 2);
        const season2 = new Season([2], 2);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(false);
    });

    test('should equals false (wrong season and undefined part)', () => {
        const season1 = new Season([1], undefined);
        const season2 = new Season([2], 2);

        expect(SeasonComperator.isSameSeason(season1, season2)).toBe(false);
    });

    test('should equals true (both undefined)', () => {
        expect(SeasonComperator.isSameSeason(undefined, undefined)).toBe(true);
    });

    test('should not be anywhere equals in a comperation result', async () => {
        const a: Series = new Series();
        const b: Series = new Series();

        // tslint:disable: no-string-literal
        a['cachedSeason'] = new Season([3], 1);
        b['cachedSeason'] = new Season([3], 2);

        const result = await SeasonComperator.compareSeasons(a, b);

        expect(result.isAbsolute).not.toBe(AbsoluteResult.ABSOLUTE_TRUE);
        expect(result.matches).toBe(0);
        expect(result.aFirstSeason).toBe(null);
        expect(result.bFirstSeason).toBe(null);
    });

    describe('Season number comperation tests', () => {
        const seasonOne = new Season([1]);
        const seasonTwo = new Season([2]);
        test('season number: 1 and season number: undefined should be true', () => {
            const seasonB = new Season(undefined);
            const result = SeasonComperator.isSameSeasonNumber(seasonOne, seasonB);
            const result2 = SeasonComperator.isSameSeasonNumber(seasonB, seasonOne);

            expect(result).toBe(true);
            expect(result2).toBe(true);
        });

        test('season number: 2 and season number: undefined should be false', () => {
            const seasonB = new Season(undefined);
            const result = SeasonComperator.isSameSeasonNumber(seasonTwo, seasonB);
            const result2 = SeasonComperator.isSameSeasonNumber(seasonB, seasonTwo);

            expect(result).toBe(false);
            expect(result2).toBe(false);
        });

        test('season number: 1 and season: undefined should be true', () => {
            const result = SeasonComperator.isSameSeasonNumber(seasonOne, undefined);
            const result2 = SeasonComperator.isSameSeasonNumber(undefined, seasonOne);

            expect(result).toBe(true);
            expect(result2).toBe(true);
        });

        test('season number: 2 and season: undefined should be false', () => {
            const result = SeasonComperator.isSameSeasonNumber(seasonTwo, undefined);
            const result2 = SeasonComperator.isSameSeasonNumber(undefined, seasonTwo);

            expect(result).toBe(false);
            expect(result2).toBe(false);
        });
    });

    describe('season part comperation tests', () => {
        const seasonOne = new Season([1]);
        test('season part: 1 and season part: undefined should be true', () => {
            const seasonA = new Season([1], 1);
            const seasonB = undefined;
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonB);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonB, seasonA);

            expect(result).toBe(true);
            expect(result2).toBe(true);
        });

        test('season part: 1 and season two: undefined should be false', () => {
            const seasonA = new Season([1], 2);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, undefined);
            const result2 = SeasonComperator.isSameSeasonPartNumber(undefined, seasonA);

            expect(result).toBe(false);
            expect(result2).toBe(false);
        });

        test('season part: 1 and season part: 1 should be true', () => {
            const seasonA = new Season([1], 1);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonOne);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonOne, seasonA);

            expect(result).toBe(true);
            expect(result2).toBe(true);
        });

        test('season part: 1 and season two: 1 should be false', () => {
            const seasonA = new Season([1], 2);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonOne);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonOne, seasonA);

            expect(result).toBe(false);
            expect(result2).toBe(false);
        });
    });
});
