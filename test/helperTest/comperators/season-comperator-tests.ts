import { strictEqual } from 'assert';
import Season from '../../../src/backend/controller/objects/meta/season';
import SeasonComperator from '../../../src/backend/helpFunctions/comperators/season-comperator';
import TestHelper from '../../test-helper';

describe('Season Comperator tests', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should equals true (same season)', () => {
        const season1 = new Season(1);
        const season2 = new Season(1);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals false (undefined vs existing season)', () => {
        const season1 = new Season(1);

        strictEqual(SeasonComperator.isSameSeason(season1, undefined), false);
    });

    test('should equals false (wrong part) ', () => {
        const season1 = new Season(1, 1);
        const season2 = new Season(1, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), false);
    });

    test('should equals true (right season and part)', () => {
        const season1 = new Season(1, 2);
        const season2 = new Season(1, 2);

        strictEqual(SeasonComperator.isSameSeason(season1, season2), true);
    });

    test('should equals true (both undefined)', () => {
        strictEqual(SeasonComperator.isSameSeason(undefined, undefined), true);
    });
});
