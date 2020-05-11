import Season from '../../../../src/backend/controller/objects/meta/season';
import { SeasonError } from '../../../../src/backend/controller/objects/transfer/season-error';


describe('Season object tests', () => {
    test('season should not be defined', () => {
        const undefinedSeason = new Season();
        expect(undefinedSeason.isSeasonUndefined()).toBeTruthy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeFalsy();
    });

    test('season should not be defined (empty season number list)', () => {
        const undefinedSeason = new Season([]);
        expect(undefinedSeason.isSeasonUndefined()).toBeTruthy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeFalsy();
    });

    test('there should be a season number (S1)', () => {
        const undefinedSeason = new Season(['S1']);
        expect(undefinedSeason.isSeasonUndefined()).toBeFalsy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeFalsy();
    });

    test('is season number present', () => {
        const undefinedSeason = new Season(0, 0, SeasonError.NONE);
        expect(undefinedSeason.isSeasonUndefined()).toBeFalsy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeTruthy();
    });

    test('should not get the season number string', () => {
        const undefinedSeason = new Season('test', 0, SeasonError.NONE);
        expect(undefinedSeason.isSeasonUndefined()).toBeFalsy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeFalsy();
        expect(undefinedSeason.getSingleSeasonNumberAsNumber()).toBeUndefined();
    });

    test('should get the season number', () => {
        const undefinedSeason = new Season(1, 0, SeasonError.NONE);
        expect(undefinedSeason.isSeasonUndefined()).toBeFalsy();
        expect(undefinedSeason.isSeasonNumberPresent()).toBeTruthy();
        expect(undefinedSeason.getSingleSeasonNumberAsNumber()).toEqual(1);
    });
});
