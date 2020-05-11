import Season from '../../../src/backend/controller/objects/meta/season';

describe('Season object tests', () => {
    test('should detect that no season number is avaible', () => {
        const season = new Season();
        expect(season.isSeasonNumberPresent()).toBeFalsy();
    });

    test('should detect that a season number is avaible', () => {
        const season = new Season(1);
        expect(season.isSeasonNumberPresent()).toBeTruthy();
    });
});
