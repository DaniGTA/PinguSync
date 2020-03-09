import { strictEqual } from 'assert';
import Season from '../../../../src/backend/controller/objects/meta/season';
import { SeasonError } from '../../../../src/backend/controller/objects/transfer/season-error';


describe('Season object tests', () => {
    test('season should not be defined', () => {
        const undefinedSeason = new Season();
        strictEqual(undefinedSeason.isSeasonUndefined(), true);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), false);
    });

    test('season should not be defined (empty season number list)', () => {
        const undefinedSeason = new Season([]);
        strictEqual(undefinedSeason.isSeasonUndefined(), true);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), false);
    });

    test('there should be a season number (S1)', () => {
        const undefinedSeason = new Season(['S1']);
        strictEqual(undefinedSeason.isSeasonUndefined(), false);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), false);
    });

    test('is season number present', () => {
        const undefinedSeason = new Season(0, 0, SeasonError.NONE);
        strictEqual(undefinedSeason.isSeasonUndefined(), false);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), true);
    });

    test('should not get the season number string', () => {
        const undefinedSeason = new Season('test', 0, SeasonError.NONE);
        strictEqual(undefinedSeason.isSeasonUndefined(), false);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), false);
        strictEqual(undefinedSeason.getSingleSeasonNumberAsNumber(), undefined);
    });

    test('should get the season number', () => {
        const undefinedSeason = new Season(1, 0, SeasonError.NONE);
        strictEqual(undefinedSeason.isSeasonUndefined(), false);
        strictEqual(undefinedSeason.isSeasonNumberPresent(), true);
        strictEqual(undefinedSeason.getSingleSeasonNumberAsNumber(), 1);
    });
});
