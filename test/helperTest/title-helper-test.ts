import { strictEqual } from 'assert';
import TitleHelper from '../../src/backend/helpFunctions/name-helper/title-helper';
import TestHelper from '../test-helper';

describe('Title Checker | Some title examples', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });

    describe('should get season number by title', () => {
        test('marked season title with season number in it', () => {
            strictEqual(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title Season 2').seasonNumber, 2);
        });

        test('marked s title with season number in it', () => {
            strictEqual(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title s2').seasonNumber, 2);
        });

        test('marked nd title with season number in it', () => {
            strictEqual(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title 2nd').seasonNumber, 2);
        });
    });
});
