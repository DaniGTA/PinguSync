import { strictEqual, notStrictEqual } from 'assert';
import Season from '../../../src/backend/controller/objects/meta/season';
import SeasonComperator from '../../../src/backend/helpFunctions/comperators/season-comperator';
import TestHelper from '../../test-helper';
import Series from '../../../src/backend/controller/objects/series';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';

describe('Season Comperator tests', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should equals true (same season)', () => {
        const season1 = new Season(1);
        const season2 = new Season(1);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals true (wrong season)', () => {
        const season1 = new Season(1);
        const season2 = new Season(2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals false (undefined vs existing season)', () => {
        const season1 = new Season(1);

        strictEqual(SeasonComperator.isSameSeason(season1, undefined), false);
    });

    test('should equals false (right season and wrong part) ', () => {
        const season1 = new Season(1, 1);
        const season2 = new Season(1, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (right season and part)', () => {
        const season1 = new Season(1, 2);
        const season2 = new Season(1, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals true (wrong season and right part)', () => {
        const season1 = new Season(1, 2);
        const season2 = new Season(2, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (wrong season and undefined part)', () => {
        const season1 = new Season(1, undefined);
        const season2 = new Season(2, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (both undefined)', () => {
        strictEqual(SeasonComperator.isSameSeason(undefined, undefined), true);
    });

    test('should not be anywhere equals in a comperation result', async () => {
        const a: Series = new Series();
        const b: Series = new Series();

        // tslint:disable: no-string-literal
        a['cachedSeason'] = new Season(3, 1);
        b['cachedSeason'] = new Season(3, 2);

        const result = await SeasonComperator.compareSeasons(a, b);

        notStrictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_TRUE);
        strictEqual(result.matches, 0);
        strictEqual(result.aFirstSeason, null);
        strictEqual(result.bFirstSeason, null);
    });
});
