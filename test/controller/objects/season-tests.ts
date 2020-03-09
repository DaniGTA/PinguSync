import { strictEqual } from 'assert';
import Season from '../../../src/backend/controller/objects/meta/season';

describe('Season object tests', () => {
    test('should detect that no season number is avaible', async () => {
        const season = new Season();
        strictEqual(season.isSeasonNumberPresent(), false);
    });

    test('should detect that a season number is avaible', async () => {
        const season = new Season(1);
        strictEqual(season.isSeasonNumberPresent(), true);
    });
});
