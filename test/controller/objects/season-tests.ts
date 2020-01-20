import { strictEqual } from 'assert';
import Season from '../../../src/backend/controller/objects/meta/season';
import TestHelper from '../../test-helper';

describe('Season object tests', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should detect that no season number is avaible', async () => {
        const season = new Season();
        strictEqual(season.isSeasonNumberPresent(), false);
    });

    test('should detect that a season number is avaible', async () => {
        const season = new Season(1);
        strictEqual(season.isSeasonNumberPresent(), true);
    });
});
