import TitleHelper from '../../src/backend/helpFunctions/name-helper/title-helper';


describe('Title Checker | Some title examples', () => {
    describe('should get season number by title', () => {
        test('marked season title with season number in it', () => {
            expect(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title Season 2').seasonNumber).toBe(2);
        });

        test('marked s title with season number in it', () => {
            expect(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title s2').seasonNumber).toBe(2);
        });

        test('marked nd title with season number in it', () => {
            expect(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('Title 2nd').seasonNumber).toBe(2);
        });

        test('marked slug nd title with season number in it', () => {
            expect(TitleHelper.getSeasonNumberBySeasonMarkerInTitle('test-2nd-season').seasonNumber).toBe(2);
        });
    });
});
