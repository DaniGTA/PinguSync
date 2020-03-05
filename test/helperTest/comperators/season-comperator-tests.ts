import { notStrictEqual, strictEqual } from 'assert';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import SeasonComperator from '../../../src/backend/helpFunctions/comperators/season-comperator';


describe('Season Comperator tests', () => {
    beforeEach(() => {
    });
    test('should equals true (same season)', () => {
        const season1 = new Season([1]);
        const season2 = new Season([1]);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals false (wrong season)', () => {
        const season1 = new Season([1]);
        const season2 = new Season([2]);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals false (right season and wrong part) ', () => {
        const season1 = new Season([1], 1);
        const season2 = new Season([1], 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (right season and part)', () => {
        const season1 = new Season([1], 2);
        const season2 = new Season([1], 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals false (wrong season and right part)', () => {
        const season1 = new Season([1], 2);
        const season2 = new Season([2], 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals false (wrong season and undefined part)', () => {
        const season1 = new Season([1], undefined);
        const season2 = new Season([2], 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (both undefined)', () => {
        strictEqual(SeasonComperator.isSameSeason(undefined, undefined), true);
    });

    test('should not be anywhere equals in a comperation result', async () => {
        const a: Series = new Series();
        const b: Series = new Series();

        // tslint:disable: no-string-literal
        a['cachedSeason'] = new Season([3], 1);
        b['cachedSeason'] = new Season([3], 2);

        const result = await SeasonComperator.compareSeasons(a, b);

        notStrictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_TRUE);
        strictEqual(result.matches, 0);
        strictEqual(result.aFirstSeason, null);
        strictEqual(result.bFirstSeason, null);
    });

    describe('Season number comperation tests', () => {
        const seasonOne = new Season([1]);
        const seasonTwo = new Season([2]);
        test('season number: 1 and season number: undefined should be true', () => {
            const seasonB = new Season(undefined);
            const result = SeasonComperator.isSameSeasonNumber(seasonOne, seasonB);
            const result2 = SeasonComperator.isSameSeasonNumber(seasonB, seasonOne);

            strictEqual(result, true);
            strictEqual(result2, true);
        });

        test('season number: 2 and season number: undefined should be false', () => {
            const seasonB = new Season(undefined);
            const result = SeasonComperator.isSameSeasonNumber(seasonTwo, seasonB);
            const result2 = SeasonComperator.isSameSeasonNumber(seasonB, seasonTwo);

            strictEqual(result, false);
            strictEqual(result2, false);
        });

        test('season number: 1 and season: undefined should be true', () => {
            const result = SeasonComperator.isSameSeasonNumber(seasonOne, undefined);
            const result2 = SeasonComperator.isSameSeasonNumber(undefined, seasonOne);

            strictEqual(result, true);
            strictEqual(result2, true);
        });

        test('season number: 2 and season: undefined should be false', () => {
            const result = SeasonComperator.isSameSeasonNumber(seasonTwo, undefined);
            const result2 = SeasonComperator.isSameSeasonNumber(undefined, seasonTwo);

            strictEqual(result, false);
            strictEqual(result2, false);
        });
    });

    describe('season part comperation tests', () => {
        const seasonOne = new Season([1]);
        test('season part: 1 and season part: undefined should be true', () => {
            const seasonA = new Season([1], 1);
            const seasonB = undefined;
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonB);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonB, seasonA);

            strictEqual(result, true);
            strictEqual(result2, true);
        });

        test('season part: 1 and season part: undefined should be false', () => {
            const seasonA = new Season([1], 2);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, undefined);
            const result2 = SeasonComperator.isSameSeasonPartNumber(undefined, seasonA);

            strictEqual(result, false);
            strictEqual(result2, false);
        });

        test('season part: 1 and season part: undefined should be true', () => {
            const seasonA = new Season([1], 1);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonOne);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonOne, seasonA);

            strictEqual(result, true);
            strictEqual(result2, true);
        });

        test('season part: 1 and season part: undefined should be false', () => {
            const seasonA = new Season([1], 2);
            const result = SeasonComperator.isSameSeasonPartNumber(seasonA, seasonOne);
            const result2 = SeasonComperator.isSameSeasonPartNumber(seasonOne, seasonA);

            strictEqual(result, false);
            strictEqual(result2, false);
        });
    });
});
